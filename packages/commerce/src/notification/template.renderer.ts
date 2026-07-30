import { prisma as db } from '@corecart/database';
import { NotificationChannel } from "@prisma/client";

export interface RenderedTemplate {
  templateId: string;
  version: number;
  subject?: string;
  html?: string;
  text?: string;
}

export class TemplateRenderer {
  /**
   * Replace handlebar style tokens e.g. {{customerName}}, {{orderNumber}}, {{user.firstName}}
   */
  static renderString(template: string, payload: Record<string, any>): string {
    if (!template) return "";

    return template.replace(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, key) => {
      const value = this.getNestedValue(payload, key);
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  private static getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  /**
   * Fetch active template by event name & channel, and render HTML & text with payload variables
   */
  static async render(event: string, channel: NotificationChannel, payload: Record<string, any>): Promise<RenderedTemplate | null> {
    const template = await db.notificationTemplate.findUnique({
      where: { event_channel: { event, channel } },
      include: {
        versions: { orderBy: { version: "desc" }, take: 1 },
      },
    });

    if (!template || !template.isActive) return null;

    // Use latest version content if available, fallback to template top-level
    const latestVersion = template.versions[0];
    const rawSubject = latestVersion?.subject || template.subject || "";
    const rawHtml = latestVersion?.html || template.html || "";
    const rawText = latestVersion?.text || template.text || "";

    const renderedSubject = this.renderString(rawSubject, payload);
    const renderedHtml = this.renderString(rawHtml, payload);
    const renderedText = this.renderString(rawText, payload);

    return {
      templateId: template.id,
      version: template.currentVersion,
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
    };
  }
}
