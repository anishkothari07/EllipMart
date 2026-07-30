import { NotificationChannel } from "@prisma/client";
import { INotificationProvider, ProviderDispatchOptions, ProviderDispatchResult } from "./provider.interface";
import { sseManager } from "../sse.manager";

export class BrowserProvider implements INotificationProvider {
  id = "IN_APP_BROWSER";
  channel = NotificationChannel.BROWSER;

  async send(options: ProviderDispatchOptions): Promise<ProviderDispatchResult> {
    const start = Date.now();
    const recipientId = options.recipient;

    // Broadcast in real-time via SSE Manager to connected browser clients
    sseManager.broadcastToUser(recipientId, "notification", {
      title: options.title || options.subject || "New Notification",
      body: options.body,
      data: options.data,
      actions: options.actions,
    });

    return {
      providerName: this.id,
      channel: this.channel,
      success: true,
      messageId: `browser_${Date.now()}`,
      latencyMs: Date.now() - start,
    };
  }
}
