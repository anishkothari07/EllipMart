import { domainEventBus } from '@corecart/shared';
import { prisma as db } from '@corecart/database';
import { AnalyticsEventType } from "@prisma/client";

export class AnalyticsEventProcessor {
  static init() {
    // Subscribe to all events using wildcard subscribeAll
    domainEventBus.subscribeAll(async (event) => {
      try {
        const data = {
          ...(event.payload || {}),
          organizationId: event.organizationId,
          websiteId: event.websiteId,
        };
        await this.processEvent(event.eventName, data);
      } catch (err) {
        console.error(`[AnalyticsEventProcessor] Error processing event:`, err);
      }
    });
  }

  private static mapEventToType(event: string): AnalyticsEventType | null {
    switch (event) {
      case "UserRegistered": return AnalyticsEventType.REGISTER;
      case "UserLoggedIn": return AnalyticsEventType.LOGIN;
      case "ProductViewed": return AnalyticsEventType.PRODUCT_VIEW;
      case "SearchPerformed": return AnalyticsEventType.SEARCH;
      case "WishlistAdded": return AnalyticsEventType.PAGE_VIEW;
      case "CartUpdated": return AnalyticsEventType.ADD_TO_CART;
      case "CheckoutStarted": return AnalyticsEventType.CHECKOUT;
      case "PaymentStarted": return AnalyticsEventType.PAYMENT;
      case "PaymentSuccess": return AnalyticsEventType.PURCHASE;
      case "PaymentFailed": return AnalyticsEventType.PAYMENT;
      case "OrderCreated": return AnalyticsEventType.CHECKOUT;
      case "OrderCancelled": return AnalyticsEventType.RETURN;
      case "RefundIssued": return AnalyticsEventType.REFUND;
      case "ReviewSubmitted": return AnalyticsEventType.PAGE_VIEW;
      case "MediaUploaded": return AnalyticsEventType.MEDIA_VIEW;
      case "NotificationSent": return AnalyticsEventType.NOTIFICATION_OPEN;
      default: return null;
    }
  }

  private static async processEvent(event: string, data: any) {
    const eventType = this.mapEventToType(event);
    if (!eventType) return;

    // Clean data for properties JSON
    const properties = { ...data };
    delete properties.userId;
    delete properties.organizationId;
    delete properties.websiteId;
    delete properties.sessionId;

    await db.analyticsEvent.create({
      data: {
        organizationId: data.organizationId || null,
        websiteId: data.websiteId || null,
        userId: data.userId || null,
        sessionId: data.sessionId || null,
        event: eventType,
        category: data.category || "GENERAL",
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        properties: JSON.stringify(properties),
        ipAddress: data.ipAddress || null,
        country: data.country || "Unknown",
        city: data.city || "Unknown",
        device: data.device || "Desktop",
        browser: data.browser || "Chrome",
        platform: data.platform || "Windows",
        referrer: data.referrer || null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
      }
    });

    // Handle session creation/update on PAGE_VIEW or PRODUCT_VIEW
    if (eventType === AnalyticsEventType.PAGE_VIEW || eventType === AnalyticsEventType.PRODUCT_VIEW) {
      const visitorId = data.visitorId || data.userId || "anonymous";
      const sessionId = data.sessionId || "session-id";
      
      await db.analyticsSession.upsert({
        where: { id: sessionId },
        update: {
          pageViews: { increment: 1 },
          endedAt: new Date(),
        },
        create: {
          id: sessionId,
          userId: data.userId || null,
          visitorId,
          startedAt: new Date(),
          endedAt: new Date(),
          device: data.device || "Desktop",
          browser: data.browser || "Chrome",
          os: data.platform || "Windows",
          country: data.country || "Unknown",
          city: data.city || "Unknown",
          entryPage: data.page || "/",
          exitPage: data.page || "/",
        }
      });

      if (data.page) {
        await db.analyticsPageView.create({
          data: {
            sessionId,
            page: data.page,
            title: data.pageTitle || null,
            referrer: data.referrer || null,
          }
        });
      }
    }
  }
}
