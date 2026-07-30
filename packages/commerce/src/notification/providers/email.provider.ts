import { NotificationChannel } from "@prisma/client";
import { INotificationProvider, ProviderDispatchOptions, ProviderDispatchResult } from "./provider.interface";
import { emailService } from '../../services/email.service';

export class EmailProvider implements INotificationProvider {
  id = "EMAIL_PRIMARY";
  channel = NotificationChannel.EMAIL;

  async send(options: ProviderDispatchOptions): Promise<ProviderDispatchResult> {
    const start = Date.now();
    try {
      const res = await emailService.sendEmail({
        to: options.recipient,
        subject: options.subject || `${process.env.NEXT_PUBLIC_APP_NAME || 'Store'} Notification`,
        text: options.body,
        html: options.html || `<p>${options.body}</p>`,
      });

      return {
        providerName: this.id,
        channel: this.channel,
        success: true,
        messageId: res.messageId || `email_${Date.now()}`,
        responseRaw: res,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        providerName: this.id,
        channel: this.channel,
        success: false,
        error: err.message || "Failed sending email notification",
        latencyMs: Date.now() - start,
      };
    }
  }
}
