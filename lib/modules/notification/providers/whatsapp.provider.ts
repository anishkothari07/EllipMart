import { NotificationChannel } from "@prisma/client";
import { INotificationProvider, ProviderDispatchOptions, ProviderDispatchResult } from "./provider.interface";

export class WhatsAppProvider implements INotificationProvider {
  id = "META_WHATSAPP";
  channel = NotificationChannel.WHATSAPP;

  async send(options: ProviderDispatchOptions): Promise<ProviderDispatchResult> {
    const start = Date.now();
    console.log(`[WhatsApp Provider] Sending WhatsApp message to ${options.recipient}: ${options.body.slice(0, 60)}...`);

    const messageId = `wa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      providerName: this.id,
      channel: this.channel,
      success: true,
      messageId,
      responseRaw: { status: "SENT", recipient: options.recipient },
      latencyMs: Date.now() - start,
    };
  }
}
