import { prisma as db } from "@/lib/prisma/client";
import {
  NotificationChannel,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
} from "@prisma/client";
import { domainEventBus, DomainEventPayload } from "@/lib/events/domain-event.bus";
import { TemplateRenderer } from "./template.renderer";
import { NotificationJobProcessor } from "./notification.job";

export interface SendNotificationInput {
  recipientId?: string;
  recipientContact?: string; // Email, phone, device token, or webhook URL
  event: string;
  category?: NotificationCategory;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  payload?: Record<string, any>;
  title?: string;
  body?: string;
  actions?: { label: string; url: string; type?: string }[];
  organizationId?: string;
  websiteId?: string;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export class NotificationService {
  constructor() {
    this.registerDomainEventSubscribers();
  }

  /**
   * Listen to global DomainEventBus and auto-dispatch notifications
   */
  private registerDomainEventSubscribers() {
    domainEventBus.subscribe("UserRegistered", async (evt) => {
      await this.sendNotification({
        recipientId: evt.payload.userId,
        recipientContact: evt.payload.email,
        event: "UserRegistered",
        category: NotificationCategory.AUTH,
        channel: NotificationChannel.EMAIL,
        payload: evt.payload,
        title: "Welcome to SmartGO!",
        body: `Hi ${evt.payload.firstName || "there"}, welcome to SmartGO!`,
        actions: [{ label: "Browse Products", url: "/products" }],
      });
    });

    domainEventBus.subscribe("OrderCreated", async (evt) => {
      await this.sendNotification({
        recipientId: evt.payload.userId,
        recipientContact: evt.payload.email,
        event: "OrderCreated",
        category: NotificationCategory.ORDER,
        channel: NotificationChannel.EMAIL,
        payload: evt.payload,
        title: `Order ${evt.payload.orderNumber} Confirmed`,
        body: `Your order ${evt.payload.orderNumber} has been created. Total: ₹${evt.payload.amount || ""}`,
        actions: [{ label: "View Order", url: `/account/orders/${evt.payload.orderId}` }],
      });

      // Send In-App Browser Notification as well
      await this.sendNotification({
        recipientId: evt.payload.userId,
        event: "OrderCreated",
        category: NotificationCategory.ORDER,
        channel: NotificationChannel.BROWSER,
        payload: evt.payload,
        title: `Order #${evt.payload.orderNumber} Placed`,
        body: "We are processing your order right now.",
        actions: [{ label: "View Order", url: `/account/orders/${evt.payload.orderId}` }],
      });
    });

    domainEventBus.subscribe("OrderPaid", async (evt) => {
      await this.sendNotification({
        recipientId: evt.payload.userId,
        recipientContact: evt.payload.email,
        event: "OrderPaid",
        category: NotificationCategory.PAYMENT,
        channel: NotificationChannel.EMAIL,
        payload: evt.payload,
        title: `Payment Successful for Order ${evt.payload.orderNumber}`,
        body: `We have received your payment for order ${evt.payload.orderNumber}.`,
        actions: [{ label: "Track Package", url: `/account/orders/${evt.payload.orderId}` }],
      });
    });

    domainEventBus.subscribe("ShipmentCreated", async (evt) => {
      await this.sendNotification({
        recipientId: evt.payload.userId,
        recipientContact: evt.payload.email,
        event: "ShipmentCreated",
        category: NotificationCategory.SHIPPING,
        channel: NotificationChannel.EMAIL,
        payload: evt.payload,
        title: `Order ${evt.payload.orderNumber} Shipped!`,
        body: `Tracking Number: ${evt.payload.trackingNumber || "N/A"}`,
        actions: [{ label: "Track Package", url: `/account/orders/${evt.payload.orderId}` }],
      });
    });

    domainEventBus.subscribe("PaymentFailed", async (evt) => {
      await this.sendNotification({
        recipientId: evt.payload.userId,
        recipientContact: evt.payload.email,
        event: "PaymentFailed",
        category: NotificationCategory.PAYMENT,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
        payload: evt.payload,
        title: `Payment Failed for Order ${evt.payload.orderNumber}`,
        body: "Your payment attempt failed. Please click below to retry payment.",
        actions: [{ label: "Retry Payment", url: `/checkout/payment?orderId=${evt.payload.orderId}` }],
      });
    });

    domainEventBus.subscribe("InventoryLow", async (evt) => {
      await this.sendNotification({
        recipientContact: "admin@smartgo.com",
        event: "InventoryLow",
        category: NotificationCategory.SYSTEM,
        channel: NotificationChannel.EMAIL,
        payload: evt.payload,
        title: `Low Stock Alert: ${evt.payload.productName}`,
        body: `Only ${evt.payload.stock} items remaining for ${evt.payload.productName}.`,
      });
    });
  }

  /**
   * Primary entrypoint to dispatch a notification
   */
  async sendNotification(input: SendNotificationInput) {
    const {
      recipientId,
      recipientContact,
      event,
      category = NotificationCategory.ORDER,
      channel = NotificationChannel.EMAIL,
      priority = NotificationPriority.NORMAL,
      payload = {},
      title,
      body,
      actions = [],
      organizationId,
      websiteId,
      scheduledAt,
      expiresAt,
    } = input;

    // 1. Check User Preference Matrix if recipientId provided
    if (recipientId) {
      const pref = await db.notificationSetting.findUnique({
        where: { userId_category_channel: { userId: recipientId, category, channel } },
      });
      if (pref && !pref.enabled) {
        console.log(`[Notification Engine] Preference check: User ${recipientId} opted out of ${category} via ${channel}`);
        return null;
      }
    }

    // 2. Render Template from Database
    let finalTitle = title || event;
    let finalBody = body || "";
    let templateId: string | undefined = undefined;

    const rendered = await TemplateRenderer.render(event, channel, payload);
    if (rendered) {
      templateId = rendered.templateId;
      if (rendered.subject) finalTitle = rendered.subject;
      if (rendered.html || rendered.text) finalBody = rendered.html || rendered.text || "";
    }

    // 3. Create Notification Record
    const notification = await db.notification.create({
      data: {
        organizationId: organizationId || null,
        websiteId: websiteId || null,
        type: event,
        category,
        channel,
        priority,
        recipientId: recipientId || null,
        recipientContact: recipientContact || null,
        status: NotificationStatus.PENDING,
        templateId: templateId || null,
        payload: JSON.stringify(payload),
        title: finalTitle,
        body: finalBody,
        scheduledAt: scheduledAt || null,
        expiresAt: expiresAt || null,
        actions: {
          create: actions.map((a) => ({ label: a.label, url: a.url, type: a.type || "PRIMARY" })),
        },
      },
      include: { actions: true },
    });

    // 4. Create NotificationJob for background worker execution
    const job = await db.notificationJob.create({
      data: {
        notificationId: notification.id,
        status: NotificationStatus.PENDING,
      },
    });

    // 5. Process Job asynchronously
    NotificationJobProcessor.processJob(job.id);

    return notification;
  }

  /**
   * Helper to trigger domain events
   */
  emit(eventName: string, payload: any, options?: { organizationId?: string; websiteId?: string }) {
    return domainEventBus.publish(eventName, payload, options);
  }
}

export const notificationService = new NotificationService();
