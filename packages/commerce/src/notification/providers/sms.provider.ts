import { NotificationChannel } from "@prisma/client";
import { INotificationProvider, ProviderDispatchOptions, ProviderDispatchResult } from "./provider.interface";

export class SMSProvider implements INotificationProvider {
  id = "TWILIO_SMS";
  channel = NotificationChannel.SMS;

  async send(options: ProviderDispatchOptions): Promise<ProviderDispatchResult> {
    const start = Date.now();
    console.log(`[SMS Provider] Sending SMS to ${options.recipient}: ${options.body.slice(0, 60)}...`);

    // Mock/Simulated Twilio or MSG91 API call
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      providerName: this.id,
      channel: this.channel,
      success: true,
      messageId,
      responseRaw: { status: "DELIVERED", recipient: options.recipient },
      latencyMs: Date.now() - start,
    };
  }
}
