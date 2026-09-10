import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { NotificationOrchestratorService } from '../orchestrator/notification-orchestrator.service';
import { CampaignStatus, NotificationChannel, NotificationStatus } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly orchestrator: NotificationOrchestratorService,
  ) {}

  async createCampaign(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({ where: { id: data.schoolId, organizationId } });
    if (!school) throw new NotFoundException('School not found in the current organization');

    const campaign = await this.db.communicationCampaign.create({
      data: {
        title: data.title,
        description: data.description,
        targetAudience: data.targetAudience || 'ALL_SCHOOL',
        targetRoles: data.targetRoles || [],
        targetClasses: data.targetClasses || [],
        channels: data.channels || [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        subject: data.subject,
        body: data.body,
        metadata: data.metadata,
        status: data.scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        organizationId,
        schoolId: data.schoolId,
        createdById: actorId,
      },
    });

    await this.audit.log({
      action: 'communications.campaign.create',
      resource: 'CommunicationCampaign',
      resourceId: campaign.id,
      actorId,
      organizationId,
      schoolId: data.schoolId,
    });

    if (!data.scheduledAt && data.executeNow === true) {
      await this.executeCampaign(organizationId, campaign.id, actorId);
    }

    return campaign;
  }

  async executeCampaign(organizationId: string, campaignId: string, actorId: string) {
    const campaign = await this.db.communicationCampaign.findFirst({
      where: { id: campaignId, organizationId },
      include: { school: true },
    });

    if (!campaign || campaign.status === CampaignStatus.COMPLETED) {
      throw new BadRequestException('Invalid campaign or already completed');
    }

    await this.db.communicationCampaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.PROCESSING, startedAt: new Date() },
    });

    // Resolve target users
    const recipients = await this.resolveAudienceUsers(campaign.schoolId, campaign.targetAudience, campaign.targetRoles, campaign.targetClasses);

    let sentCount = 0;
    let failedCount = 0;

    for (const user of recipients) {
      try {
        // Queue each channel and dispatch through the notification routing engine.
        let recipientSucceeded = false;
        let lastFailure = '';
        for (const channel of campaign.channels) {
          const notification = await this.db.notification.create({
            data: {
              organizationId,
              schoolId: campaign.schoolId,
              event: 'campaign.broadcast',
              recipientId: user.id,
              channel,
              subject: campaign.subject,
              body: campaign.body,
              status: NotificationStatus.QUEUED,
              metadata: { campaignId: campaign.id },
            },
          });
          const delivery = await this.orchestrator.dispatch(notification.id);
          if (delivery?.success) recipientSucceeded = true;
          else lastFailure = delivery?.errorMessage || `Delivery failed on ${channel}`;
        }

        await this.db.campaignRecipient.upsert({
          where: { campaignId_recipientId: { campaignId, recipientId: user.id } },
          update: recipientSucceeded
            ? { status: NotificationStatus.SENT, sentAt: new Date(), error: null }
            : { status: NotificationStatus.FAILED, error: lastFailure || 'All campaign channels failed' },
          create: recipientSucceeded
            ? { campaignId, recipientId: user.id, status: NotificationStatus.SENT, sentAt: new Date() }
            : { campaignId, recipientId: user.id, status: NotificationStatus.FAILED, error: lastFailure || 'All campaign channels failed' },
        });

        if (recipientSucceeded) sentCount++; else failedCount++;
      } catch (e) {
        failedCount++;
      }
    }

    const completed = await this.db.communicationCampaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.COMPLETED,
        completedAt: new Date(),
        totalRecipients: recipients.length,
        sentCount,
        failedCount,
      },
    });

    await this.audit.log({
      action: 'communications.campaign.execute',
      resource: 'CommunicationCampaign',
      resourceId: campaignId,
      actorId,
      organizationId,
      schoolId: campaign.schoolId,
      metadata: { sentCount, failedCount, totalRecipients: recipients.length },
    });

    return completed;
  }

  private async resolveAudienceUsers(schoolId: string, audience: string, roles: string[], classes: string[]) {
    if (audience === 'ALL_SCHOOL') {
      return this.db.user.findMany({
        where: {
          OR: [
            { student: { schoolId } },
            { employee: { schoolId } },
            { guardian: { students: { some: { student: { schoolId } } } } },
          ],
        },
        select: { id: true, email: true, phone: true },
      });
    }

    if (audience === 'ROLE' && roles.length > 0) {
      return this.db.user.findMany({
        where: {
          roles: { some: { role: { name: { in: roles } } } },
          OR: [{ student: { schoolId } }, { employee: { schoolId } }],
        },
        select: { id: true, email: true, phone: true },
      });
    }

    if (audience === 'CLASS' && classes.length > 0) {
      const students = await this.db.student.findMany({
        where: {
          enrollments: { some: { classId: { in: classes }, status: 'ACTIVE' } },
        },
        select: { userId: true },
      });

      const userIds = students.map(s => s.userId).filter(Boolean) as string[];
      return this.db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, phone: true },
      });
    }

    return this.db.user.findMany({
      where: { employee: { schoolId } },
      select: { id: true, email: true, phone: true },
      take: 50,
    });
  }

  async getCampaigns(organizationId: string, schoolId: string) {
    return this.db.communicationCampaign.findMany({
      where: { schoolId, organizationId, school: { organizationId } },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCampaignStats(organizationId: string, schoolId: string) {
    const scope = { schoolId, organizationId, school: { organizationId } };
    const [total, completed, totalSent, totalFailed] = await Promise.all([
      this.db.communicationCampaign.count({ where: scope }),
      this.db.communicationCampaign.count({ where: { ...scope, status: CampaignStatus.COMPLETED } }),
      this.db.communicationCampaign.aggregate({ where: scope, _sum: { sentCount: true } }),
      this.db.communicationCampaign.aggregate({ where: scope, _sum: { failedCount: true } }),
    ]);

    return {
      totalCampaigns: total,
      completedCampaigns: completed,
      totalSentMessages: totalSent._sum.sentCount || 0,
      totalFailedMessages: totalFailed._sum.failedCount || 0,
    };
  }
}
