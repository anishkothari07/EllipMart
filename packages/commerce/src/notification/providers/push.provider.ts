import { NotificationChannel } from "@prisma/client";
import { INotificationProvider, ProviderDispatchOptions, ProviderDispatchResult } from "./provider.interface";

export class PushProvider implements INotificationProvider {
  id = "FIREBASE_FCM";
  channel = NotificationChannel.PUSH;

  async send(options: ProviderDispatchOptions): Promise<ProviderDispatchResult> {
    const start = Date.now();
    console.log(`[Push Provider] Sending Push Notification to token ${options.recipient}: ${options.title}`);

    const messageId = `fcm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      providerName: this.id,
      channel: this.channel,
      success: true,
      messageId,
      responseRaw: { multicastId: messageId, success: 1, failure: 0 },
      latencyMs: Date.now() - start,
    };
  }
}
