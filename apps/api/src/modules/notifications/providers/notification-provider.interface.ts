import { NotificationChannel } from '@prisma/client';

export interface SendOptions {
  recipient: string; // email, phone, or push token
  subject?: string;
  body: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  metadata?: Record<string, any>;
  provider?: string;
  providerConfig?: Record<string, any>;
}

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface NotificationProvider {
  channel: NotificationChannel;
  send(options: SendOptions): Promise<SendResult>;
}
