import { NotificationChannel } from '@prisma/client';

export type GatewayProvider = {
  key: string;
  name: string;
  channels: NotificationChannel[];
  category: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PUSH';
  configFields: string[];
};

/**
 * Provider catalogue intentionally contains configuration metadata only.
 * Credentials and provider-specific API calls are handled by adapters, never
 * hard-coded into school records or frontend code.
 */
export const GATEWAY_PROVIDER_CATALOG: GatewayProvider[] = [
  { key: 'TWILIO', name: 'Twilio', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['accountSid', 'authToken', 'from'] },
  { key: 'MSG91', name: 'MSG91', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['authKey', 'senderId', 'templateId'] },
  { key: '2FACTOR', name: '2Factor', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['apiKey', 'senderId', 'templateId'] },
  { key: 'FAST2SMS', name: 'Fast2SMS', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['apiKey', 'senderId', 'route'] },
  { key: 'GUPSHUP', name: 'Gupshup', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['apiKey', 'appId', 'sender'] },
  { key: 'KALEYRA', name: 'Kaleyra', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['apiKey', 'senderId'] },
  { key: 'ROUTE_MOBILE', name: 'Route Mobile', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['apiKey', 'apiSecret', 'senderId'] },
  { key: 'EXOTEL', name: 'Exotel', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['apiKey', 'apiToken', 'senderId'] },
  { key: 'KARIX', name: 'Karix', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['apiKey', 'senderId'] },
  { key: 'TEXTLOCAL', name: 'Textlocal', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['apiKey', 'sender'] },
  { key: 'SINCH', name: 'Sinch', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['servicePlanId', 'apiToken', 'from'] },
  { key: 'VONAGE', name: 'Vonage', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['apiKey', 'apiSecret', 'from'] },
  { key: 'PLIVO', name: 'Plivo', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['authId', 'authToken', 'from'] },
  { key: 'INFOBIP', name: 'Infobip', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['baseUrl', 'apiKey', 'sender'] },
  { key: 'MESSAGEBIRD', name: 'Bird / MessageBird', category: 'SMS', channels: [NotificationChannel.SMS, NotificationChannel.WHATSAPP], configFields: ['accessKey', 'workspaceId', 'originator'] },
  { key: 'AWS_SNS', name: 'Amazon SNS', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['region', 'accessKeyId', 'secretAccessKey'] },
  { key: 'AZURE_COMMUNICATION', name: 'Azure Communication Services', category: 'SMS', channels: [NotificationChannel.SMS], configFields: ['connectionString', 'from'] },
  { key: 'SENDGRID', name: 'SendGrid', category: 'EMAIL', channels: [NotificationChannel.EMAIL], configFields: ['apiKey', 'fromEmail', 'fromName'] },
  { key: 'MAILGUN', name: 'Mailgun', category: 'EMAIL', channels: [NotificationChannel.EMAIL], configFields: ['apiKey', 'domain', 'fromEmail'] },
  { key: 'POSTMARK', name: 'Postmark', category: 'EMAIL', channels: [NotificationChannel.EMAIL], configFields: ['serverToken', 'fromEmail'] },
  { key: 'AMAZON_SES', name: 'Amazon SES', category: 'EMAIL', channels: [NotificationChannel.EMAIL], configFields: ['region', 'accessKeyId', 'secretAccessKey', 'fromEmail'] },
  { key: 'BREVO', name: 'Brevo', category: 'EMAIL', channels: [NotificationChannel.EMAIL, NotificationChannel.SMS], configFields: ['apiKey', 'fromEmail', 'senderId'] },
  { key: 'RESEND', name: 'Resend', category: 'EMAIL', channels: [NotificationChannel.EMAIL], configFields: ['apiKey', 'fromEmail'] },
  { key: 'SMTP', name: 'Custom SMTP', category: 'EMAIL', channels: [NotificationChannel.EMAIL], configFields: ['host', 'port', 'username', 'password', 'fromEmail'] },
  { key: 'META_WHATSAPP_CLOUD', name: 'Meta WhatsApp Cloud API', category: 'WHATSAPP', channels: [NotificationChannel.WHATSAPP], configFields: ['accessToken', 'phoneNumberId', 'businessAccountId'] },
  { key: 'GUPSHUP_WHATSAPP', name: 'Gupshup WhatsApp', category: 'WHATSAPP', channels: [NotificationChannel.WHATSAPP], configFields: ['apiKey', 'appId', 'sourceNumber'] },
  { key: 'INTERAKT', name: 'Interakt', category: 'WHATSAPP', channels: [NotificationChannel.WHATSAPP], configFields: ['apiKey', 'sourceNumber'] },
  { key: 'AISENSY', name: 'AiSensy', category: 'WHATSAPP', channels: [NotificationChannel.WHATSAPP], configFields: ['apiKey', 'sourceNumber'] },
  { key: 'WATI', name: 'WATI', category: 'WHATSAPP', channels: [NotificationChannel.WHATSAPP], configFields: ['apiToken', 'endpoint'] },
  { key: 'FIREBASE_FCM', name: 'Firebase Cloud Messaging', category: 'PUSH', channels: [NotificationChannel.PUSH], configFields: ['projectId', 'clientEmail', 'privateKey'] },
  { key: 'ONESIGNAL', name: 'OneSignal', category: 'PUSH', channels: [NotificationChannel.PUSH], configFields: ['appId', 'apiKey'] },
  { key: 'WEB_PUSH', name: 'Web Push (VAPID)', category: 'PUSH', channels: [NotificationChannel.PUSH], configFields: ['publicKey', 'privateKey', 'subject'] },
];
