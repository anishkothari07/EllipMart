import { NotificationChannel } from "@prisma/client";

export interface ProviderDispatchOptions {
  recipient: string; // Email address, Phone number, Device Token, or Webhook URL
  subject?: string;
  body: string; // Plain text or rendered HTML
  html?: string;
  title?: string;
  data?: Record<string, any>;
  actions?: { label: string; url: string; type?: string }[];
  secret?: string; // For Webhook HMAC signature
}

export interface ProviderDispatchResult {
  providerName: string;
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  responseRaw?: any;
  error?: string;
  latencyMs: number;
}

export interface INotificationProvider {
  id: string; // e.g. "RESEND", "SMTP", "TWILIO", "META_WHATSAPP", "FCM", "WEBHOOK", "SLACK"
  channel: NotificationChannel;
  send(options: ProviderDispatchOptions): Promise<ProviderDispatchResult>;
}
