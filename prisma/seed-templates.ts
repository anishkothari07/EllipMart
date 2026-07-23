import "dotenv/config";
import { prisma as db } from "../lib/prisma/client";
import { NotificationChannel, NotificationCategory } from "@prisma/client";

const defaultTemplates = [
  {
    event: "UserRegistered",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.AUTH,
    name: "Welcome Email",
    subject: "Welcome to SmartGO, {{firstName}}!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Welcome to SmartGO, {{firstName}}!</h2>
        <p>We are thrilled to have you on board.</p>
        <p>Explore our premium collections and discover exclusive member offers.</p>
        <a href="{{websiteUrl}}" style="background: #4F46E5; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Start Shopping</a>
      </div>
    `,
    text: "Welcome to SmartGO, {{firstName}}! Visit {{websiteUrl}} to start shopping.",
    variables: JSON.stringify(["firstName", "email", "websiteUrl"]),
  },
  {
    event: "EmailVerified",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.AUTH,
    name: "Email OTP Verification",
    subject: "{{otp}} is your SmartGO verification code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Verify Your Email</h3>
        <p>Your 6-digit verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #10B981;">{{otp}}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
    text: "Your SmartGO verification code is {{otp}}. Expires in 10 minutes.",
    variables: JSON.stringify(["otp", "email"]),
  },
  {
    event: "PasswordReset",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.SECURITY,
    name: "Password Reset Request",
    subject: "Reset your SmartGO password",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Password Reset Request</h3>
        <p>Hi {{firstName}}, click below to reset your password:</p>
        <a href="{{resetUrl}}" style="background: #EF4444; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Reset Password</a>
      </div>
    `,
    text: "Hi {{firstName}}, reset your password here: {{resetUrl}}",
    variables: JSON.stringify(["firstName", "resetUrl"]),
  },
  {
    event: "OrderCreated",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.ORDER,
    name: "Order Confirmation Email",
    subject: "Order Confirmed: #{{orderNumber}}",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #10B981;">Order Confirmed!</h2>
        <p>Hi {{firstName}}, thank you for your order <strong>#{{orderNumber}}</strong>.</p>
        <p>Total Amount: <strong>₹{{amount}}</strong></p>
        <a href="{{orderUrl}}" style="background: #111827; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">View Order Details</a>
      </div>
    `,
    text: "Hi {{firstName}}, order #{{orderNumber}} confirmed for ₹{{amount}}.",
    variables: JSON.stringify(["firstName", "orderNumber", "amount", "orderUrl"]),
  },
  {
    event: "OrderPaid",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.PAYMENT,
    name: "Payment Invoice Receipt",
    subject: "Payment Received for Order #{{orderNumber}}",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Payment Successful</h2>
        <p>We received your payment of ₹{{amount}} for order <strong>#{{orderNumber}}</strong> via {{paymentMethod}}.</p>
      </div>
    `,
    text: "Payment of ₹{{amount}} received for order #{{orderNumber}}.",
    variables: JSON.stringify(["orderNumber", "amount", "paymentMethod"]),
  },
  {
    event: "ShipmentCreated",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.SHIPPING,
    name: "Order Shipped Email",
    subject: "Your Order #{{orderNumber}} has been shipped!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your package is on its way!</h2>
        <p>Tracking Number: <strong>{{trackingNumber}}</strong> (Carrier: {{courier}})</p>
        <a href="{{trackingUrl}}" style="background: #3B82F6; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Track Package</a>
      </div>
    `,
    text: "Order #{{orderNumber}} shipped! Tracking: {{trackingNumber}}",
    variables: JSON.stringify(["orderNumber", "trackingNumber", "courier", "trackingUrl"]),
  },
  {
    event: "ShipmentDelivered",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.SHIPPING,
    name: "Order Delivered Notification",
    subject: "Order #{{orderNumber}} Delivered!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Delivered!</h2>
        <p>Your order #{{orderNumber}} was successfully delivered. We hope you love your purchase!</p>
      </div>
    `,
    text: "Order #{{orderNumber}} delivered!",
    variables: JSON.stringify(["orderNumber"]),
  },
  {
    event: "OrderCancelled",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.ORDER,
    name: "Order Cancellation Notice",
    subject: "Order #{{orderNumber}} Cancelled",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Order Cancelled</h3>
        <p>Your order #{{orderNumber}} has been cancelled. Any payments made will be refunded.</p>
      </div>
    `,
    text: "Order #{{orderNumber}} has been cancelled.",
    variables: JSON.stringify(["orderNumber"]),
  },
  {
    event: "PaymentFailed",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.PAYMENT,
    name: "Payment Failure Alert",
    subject: "Action Required: Payment Failed for Order #{{orderNumber}}",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3 style="color: #EF4444;">Payment Failed</h3>
        <p>Your payment attempt for order #{{orderNumber}} was unsuccessful.</p>
        <a href="{{retryUrl}}" style="background: #EF4444; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Retry Payment Now</a>
      </div>
    `,
    text: "Payment failed for order #{{orderNumber}}. Retry here: {{retryUrl}}",
    variables: JSON.stringify(["orderNumber", "retryUrl"]),
  },
  {
    event: "RefundIssued",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.PAYMENT,
    name: "Refund Processing Notice",
    subject: "Refund Issued for Order #{{orderNumber}}",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Refund Processed</h3>
        <p>A refund of ₹{{refundAmount}} has been issued for order #{{orderNumber}}.</p>
      </div>
    `,
    text: "Refund of ₹{{refundAmount}} issued for order #{{orderNumber}}.",
    variables: JSON.stringify(["orderNumber", "refundAmount"]),
  },
  {
    event: "WishlistPriceDrop",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.PROMOTION,
    name: "Wishlist Price Drop Alert",
    subject: "Price Drop Alert: {{productName}} is now ₹{{newPrice}}!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #8B5CF6;">Price Drop Alert!</h2>
        <p>An item in your wishlist (<strong>{{productName}}</strong>) dropped from ₹{{oldPrice}} to ₹{{newPrice}}!</p>
        <a href="{{productUrl}}" style="background: #8B5CF6; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Buy Now</a>
      </div>
    `,
    text: "{{productName}} price dropped to ₹{{newPrice}}!",
    variables: JSON.stringify(["productName", "oldPrice", "newPrice", "productUrl"]),
  },
  {
    event: "BackInStock",
    channel: NotificationChannel.EMAIL,
    category: NotificationCategory.PROMOTION,
    name: "Back in Stock Alert",
    subject: "{{productName}} is back in stock!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Back in Stock!</h2>
        <p><strong>{{productName}}</strong> is available again. Grab yours before it sells out!</p>
        <a href="{{productUrl}}" style="background: #10B981; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Shop Now</a>
      </div>
    `,
    text: "{{productName}} is back in stock at SmartGO!",
    variables: JSON.stringify(["productName", "productUrl"]),
  },
];

async function seedNotificationTemplates() {
  console.log("Seeding 12 Enterprise Notification Templates & Versions...");

  for (const t of defaultTemplates) {
    const template = await db.notificationTemplate.upsert({
      where: { event_channel: { event: t.event, channel: t.channel } },
      update: {
        name: t.name,
        category: t.category,
        subject: t.subject,
        html: t.html,
        text: t.text,
        variables: t.variables,
      },
      create: {
        event: t.event,
        channel: t.channel,
        category: t.category,
        name: t.name,
        subject: t.subject,
        html: t.html,
        text: t.text,
        variables: t.variables,
        currentVersion: 1,
      },
    });

    // Create Version 1 snapshot
    await db.notificationTemplateVersion.upsert({
      where: { templateId_version: { templateId: template.id, version: 1 } },
      update: {
        subject: t.subject,
        html: t.html,
        text: t.text,
        variables: t.variables,
      },
      create: {
        templateId: template.id,
        version: 1,
        subject: t.subject,
        html: t.html,
        text: t.text,
        variables: t.variables,
      },
    });

    console.log(`- Seeded template: ${t.event} (${t.channel})`);
  }

  console.log("✅ Successfully seeded 12 notification templates!");
}

seedNotificationTemplates()
  .catch(console.error)
  .finally(() => db.$disconnect());
