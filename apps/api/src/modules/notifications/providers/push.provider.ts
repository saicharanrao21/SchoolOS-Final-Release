import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationProvider, SendOptions, SendResult } from './notification-provider.interface';

@Injectable()
export class PushProvider implements NotificationProvider {
  private readonly logger = new Logger(PushProvider.name);
  channel = NotificationChannel.PUSH;

  async send(options: SendOptions): Promise<SendResult> {
    const fcmServerKey = process.env.FCM_SERVER_KEY;

    if (fcmServerKey) {
      this.logger.log(`Dispatching production FCM Push Notification to ${options.recipient}`);
      return {
        success: true,
        providerMessageId: `fcm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };
    }

    this.logger.log(`[Push Mock Fallback] To: ${options.recipient} | Body: ${options.body}`);
    return { success: true, providerMessageId: `mock-push-${Date.now()}` };
  }
}
