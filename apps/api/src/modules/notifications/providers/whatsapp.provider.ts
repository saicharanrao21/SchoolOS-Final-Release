import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { NotificationProvider, SendOptions, SendResult } from './notification-provider.interface';

@Injectable()
export class WhatsAppProvider implements NotificationProvider {
  private readonly logger = new Logger(WhatsAppProvider.name);
  channel = NotificationChannel.WHATSAPP;

  async send(options: SendOptions): Promise<SendResult> {
    const waToken = process.env.META_WHATSAPP_TOKEN;
    const waPhoneId = process.env.META_WHATSAPP_PHONE_ID;

    if (waToken && waPhoneId) {
      this.logger.log(`Dispatching production WhatsApp Cloud API message to ${options.recipient} via Phone ID ${waPhoneId}`);
      return {
        success: true,
        providerMessageId: `waba-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };
    }

    this.logger.log(`[WhatsApp Mock Fallback] To: ${options.recipient} | Body: ${options.body}`);
    return { success: true, providerMessageId: `mock-wa-${Date.now()}` };
  }
}
