import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '../../../database/database.service';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
  Prisma
} from '@prisma/client';
import { EmailProvider } from '../providers/email.provider';
import { SmsProvider } from '../providers/sms.provider';
import { WhatsAppProvider } from '../providers/whatsapp.provider';
import { PushProvider } from '../providers/push.provider';
import { NotificationGatewaysService } from '../gateways/gateways.service';

@Injectable()
export class NotificationOrchestratorService {
  private readonly logger = new Logger(NotificationOrchestratorService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly whatsappProvider: WhatsAppProvider,
    private readonly pushProvider: PushProvider,
    private readonly gateways: NotificationGatewaysService,
  ) {}

  @OnEvent('**')
  async onDomainEvent(data: any, event: string) {
    if (data && data.organizationId && data.schoolId) {
      await this.handleEvent(event, data, data.organizationId, data.schoolId);
    }
  }

  async handleEvent(event: string, data: any, organizationId: string, schoolId: string) {
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) {
      this.logger.warn(`Ignoring notification event for school ${schoolId} outside organization ${organizationId}`);
      return;
    }

    this.logger.log(`Processing event: ${event} for school ${schoolId}`);

    // 1. Resolve Recipients
    const recipients = await this.resolveRecipients(event, data, organizationId, schoolId);

    for (const recipient of recipients) {
      // 2. Resolve Channels & Templates
      const channels = await this.resolveChannels(event, recipient.id, schoolId);

      for (const channel of channels) {
        // 3. Create Notification Record
        const template = await this.db.notificationTemplate.findFirst({
          where: { schoolId, event, channel, isActive: true },
          orderBy: { version: 'desc' },
        });

        if (!template && channel !== NotificationChannel.IN_APP) {
           this.logger.warn(`No template found for event ${event} on channel ${channel}`);
           continue;
        }

        const body = this.renderTemplate(template?.body || data.message || '', data);
        const subject = template?.subject ? this.renderTemplate(template.subject, data) : undefined;

        const notification = await this.db.notification.create({
          data: {
            organizationId,
            schoolId,
            event,
            recipientId: recipient.id,
            channel,
            templateId: template?.id,
            subject,
            body,
            status: NotificationStatus.QUEUED,
            priority: data.priority || NotificationPriority.NORMAL,
            metadata: data,
          },
        });

        // 4. Dispatch (For now, direct. Later, use BullMQ)
        await this.dispatch(notification.id);
      }
    }
  }

  private async resolveRecipients(event: string, data: any, organizationId: string, schoolId: string): Promise<any[]> {
    // Logic to find users based on event data
    // e.g. student.absent -> find guardians of studentId
    if (data.userId) {
      const user = await this.db.user.findFirst({ where: { id: data.userId, organizationId } });
      return user ? [user] : [];
    }

    if (data.studentId) {
       const student = await this.db.student.findUnique({
         where: { id: data.studentId, schoolId },
         include: { guardians: { include: { guardian: { include: { user: true } } } } }
       });
       return student?.guardians
         .filter((g: any) => g.hasPortalAccess && g.guardian.user)
         .map((g: any) => g.guardian.user) || [];
    }

    return [];
  }

  private async resolveChannels(event: string, userId: string, schoolId: string): Promise<NotificationChannel[]> {
    const prefs = await this.db.notificationPreference.findMany({
      where: { userId },
      select: { event: true, channel: true, isEnabled: true },
    });

    const defaultChannels = [NotificationChannel.IN_APP, NotificationChannel.PUSH];
    const matches = (pattern: string) => pattern === event ||
      (pattern.endsWith('.*') && event.startsWith(pattern.slice(0, -2)));

    const selected = new Set<NotificationChannel>();
    for (const channel of defaultChannels) {
      const relevant = prefs.filter((p: any) => p.channel === channel && matches(p.event));
      if (!relevant.length || relevant[relevant.length - 1].isEnabled) selected.add(channel);
    }

    for (const pref of prefs) {
      if (!matches(pref.event)) continue;
      if (pref.isEnabled) selected.add(pref.channel);
      else selected.delete(pref.channel);
    }

    // External channels are only eligible when a school gateway is configured.
    for (const channel of [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.WHATSAPP, NotificationChannel.PUSH]) {
      if (!selected.has(channel)) continue;
      const gateway = await this.gateways.resolveDefault(schoolId, channel);
      if (!gateway) selected.delete(channel);
    }

    return [...selected];
  }

  private renderTemplate(content: string, variables: any): string {
    let rendered = content;
    // Simple regex replacement: {{variable.path}}
    const regex = /\{\{([\w.]+)\}\}/g;
    rendered = rendered.replace(regex, (match, path) => {
      const keys = path.split('.');
      let value = variables;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      return value !== undefined ? String(value) : match;
    });
    return rendered;
  }

  async dispatch(notificationId: string) {
    const notification = await this.db.notification.findUnique({
      where: { id: notificationId },
      include: { recipient: { include: { devices: true } } },
    });

    if (!notification || !([NotificationStatus.QUEUED, NotificationStatus.RETRYING] as NotificationStatus[]).includes(notification.status)) return { success: false, status: notification?.status ?? 'MISSING' };

    await this.db.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.PROCESSING },
    });

    try {
      const gateway = notification.channel === NotificationChannel.IN_APP
        ? null
        : await this.gateways.resolveDefault(notification.schoolId, notification.channel);

      if (notification.channel !== NotificationChannel.IN_APP && !gateway) {
        throw new Error(`No active default gateway configured for ${notification.channel}`);
      }

      let result;
      const common = {
        subject: notification.subject || undefined,
        body: notification.body,
        metadata: (notification.metadata as Record<string, any>) || {},
        provider: gateway?.name,
        providerConfig: gateway?.config,
      };

      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          result = await this.emailProvider.send({ ...common, recipient: notification.recipient.email || '' });
          break;
        case NotificationChannel.SMS:
          result = await this.smsProvider.send({ ...common, recipient: notification.recipient.phone || '' });
          break;
        case NotificationChannel.WHATSAPP:
          result = await this.whatsappProvider.send({ ...common, recipient: notification.recipient.phone || '' });
          break;
        case NotificationChannel.PUSH: {
          const token = notification.recipient.devices.find((d: any) => d.isActive)?.pushToken;
          result = token
            ? await this.pushProvider.send({ ...common, recipient: token })
            : { success: false, errorMessage: 'No active device token found', errorCode: 'NO_PUSH_DEVICE' };
          break;
        }
        case NotificationChannel.IN_APP:
          result = { success: true };
          break;
      }

      if (result?.success) {
        await this.db.notification.update({
          where: { id: notificationId },
          data: {
            status: NotificationStatus.SENT,
            sentAt: new Date(),
            provider: gateway?.name,
            providerMessageId: result.providerMessageId,
            errorCode: null,
            errorMessage: null,
          },
        });
        return { success: true, status: NotificationStatus.SENT, provider: gateway?.name };
      }

      const nextRetry = notification.retryCount + 1;
      if (nextRetry <= 3) {
        await this.db.notification.update({
          where: { id: notificationId },
          data: { status: NotificationStatus.RETRYING, retryCount: nextRetry, errorCode: result?.errorCode, errorMessage: result?.errorMessage },
        });
        return { success: false, status: NotificationStatus.RETRYING, errorMessage: result?.errorMessage };
      } else {
        await this.db.notification.update({
          where: { id: notificationId },
          data: { status: NotificationStatus.FAILED, retryCount: nextRetry, failedAt: new Date(), errorCode: result?.errorCode, errorMessage: result?.errorMessage },
        });
        return { success: false, status: NotificationStatus.FAILED, errorMessage: result?.errorMessage };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Notification dispatch failed';
      const nextRetry = notification.retryCount + 1;
      await this.db.notification.update({
        where: { id: notificationId },
        data: nextRetry <= 3
          ? { status: NotificationStatus.RETRYING, retryCount: nextRetry, errorMessage: message }
          : { status: NotificationStatus.FAILED, retryCount: nextRetry, errorMessage: message, failedAt: new Date() },
      });
      this.logger.error(`Dispatch failed for notification ${notificationId}: ${message}`);
      return { success: false, status: nextRetry <= 3 ? NotificationStatus.RETRYING : NotificationStatus.FAILED, errorMessage: message };
    }
  }
}
