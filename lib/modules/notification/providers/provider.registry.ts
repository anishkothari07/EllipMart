import { NotificationChannel } from "@prisma/client";
import { INotificationProvider } from "./provider.interface";
import { EmailProvider } from "./email.provider";
import { SMSProvider } from "./sms.provider";
import { WhatsAppProvider } from "./whatsapp.provider";
import { PushProvider } from "./push.provider";
import { BrowserProvider } from "./browser.provider";
import { WebhookProvider } from "./webhook.provider";

class ProviderRegistry {
  private providers: Map<string, INotificationProvider> = new Map();

  constructor() {
    // Register Default Providers
    this.register(new EmailProvider());
    this.register(new SMSProvider());
    this.register(new WhatsAppProvider());
    this.register(new PushProvider());
    this.register(new BrowserProvider());
    this.register(new WebhookProvider());
  }

  register(provider: INotificationProvider) {
    this.providers.set(provider.id.toUpperCase(), provider);
  }

  get(id: string): INotificationProvider | undefined {
    return this.providers.get(id.toUpperCase());
  }

  getForChannel(channel: NotificationChannel): INotificationProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.channel === channel);
  }

  getDefault(channel: NotificationChannel): INotificationProvider {
    const list = this.getForChannel(channel);
    if (list.length > 0) return list[0];
    throw new Error(`No notification provider registered for channel: ${channel}`);
  }
}

export const providerRegistry = new ProviderRegistry();
