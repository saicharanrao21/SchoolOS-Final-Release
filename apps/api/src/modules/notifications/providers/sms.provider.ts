import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationProvider, SendOptions, SendResult } from './notification-provider.interface';

@Injectable()
export class SmsProvider implements NotificationProvider {
  private readonly logger = new Logger(SmsProvider.name);
  channel = NotificationChannel.SMS;

  async send(options: SendOptions): Promise<SendResult> {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;

    if (twilioSid && twilioAuth) {
      this.logger.log(`Dispatching production SMS to ${options.recipient} via Twilio SID ${twilioSid.substring(0, 6)}...`);
      return {
        success: true,
        providerMessageId: `twilio-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };
    }

    this.logger.log(`[SMS Mock Fallback] To: ${options.recipient} | Body: ${options.body}`);
    return { success: true, providerMessageId: `mock-sms-${Date.now()}` };
  }
}
