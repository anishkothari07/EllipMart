import Razorpay from "razorpay";
import crypto from "crypto";
import { PaymentStatus } from "@prisma/client";
import { IPaymentProvider, InitializePaymentOptions, InitializePaymentResult, VerifyPaymentOptions, VerifyPaymentResult, WebhookResult } from '@corecart/types';

export class RazorpayProvider implements IPaymentProvider {
  id = "RAZORPAY";
  private config: any;
  private razorpay: any;

  constructor(config?: any) {
    this.config = config || {};
    this.razorpay = new Razorpay({
      key_id: this.config.key || process.env.RAZORPAY_KEY_ID || "mock_key",
      key_secret: this.config.encryptedSecret || process.env.RAZORPAY_KEY_SECRET || "mock_secret",
    });
  }

  async initializePayment(options: InitializePaymentOptions): Promise<InitializePaymentResult> {
    const amountInPaise = Math.round(options.amount * 100);
    
    // In dev mode without keys, we skip creating a real order
    if ((this.config.key || process.env.RAZORPAY_KEY_ID) === undefined) {
      console.warn("Razorpay keys not configured. Falling back to mock order.");
      return {
        providerOrderId: `rzp_mock_order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        provider: this.id,
      };
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: options.currency,
        receipt: options.orderId,
      });

      return {
        providerOrderId: order.id,
        amount: options.amount,
        currency: options.currency,
        provider: this.id,
      };
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      throw error;
    }
  }

  async verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
    if (!options.providerOrderId || !options.signature) {
      return {
        isVerified: false,
        providerPaymentId: options.providerPaymentId,
        status: PaymentStatus.FAILED,
        rawResponse: { error: "Missing providerOrderId or signature" },
      };
    }

    if ((this.config.key || process.env.RAZORPAY_KEY_ID) === undefined && options.providerOrderId.startsWith("rzp_mock")) {
      return {
        isVerified: true,
        providerPaymentId: options.providerPaymentId,
        status: PaymentStatus.CAPTURED,
        rawResponse: { message: "Mock verification successful (no keys configured)" },
      };
    }

    const generatedSignature = crypto
      .createHmac("sha256", this.config.encryptedSecret || process.env.RAZORPAY_KEY_SECRET || "mock_secret")
      .update(`${options.providerOrderId}|${options.providerPaymentId}`)
      .digest("hex");

    if (generatedSignature === options.signature) {
      return {
        isVerified: true,
        providerPaymentId: options.providerPaymentId,
        status: PaymentStatus.CAPTURED,
      };
    }

    return {
      isVerified: false,
      providerPaymentId: options.providerPaymentId,
      status: PaymentStatus.FAILED,
      rawResponse: { error: "Signature mismatch" },
    };
  }

  async handleWebhook(rawPayload: string, signature: string): Promise<WebhookResult> {
    const secret = this.config.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || this.config.encryptedSecret || process.env.RAZORPAY_KEY_SECRET || "mock_secret";
    
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawPayload)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid Webhook Signature");
    }

    const payload = JSON.parse(rawPayload);
    const eventType = payload.event;
    
    let status: PaymentStatus = PaymentStatus.PENDING;
    if (eventType === "payment.captured") {
      status = PaymentStatus.CAPTURED;
    } else if (eventType === "payment.failed") {
      status = PaymentStatus.FAILED;
    } else if (eventType === "payment.authorized") {
      status = PaymentStatus.AUTHORIZED;
    }

    const paymentEntity = payload.payload?.payment?.entity;
    
    return {
      eventId: `rzp_evt_${Date.now()}`,
      eventType,
      providerPaymentId: paymentEntity?.id,
      status,
      rawPayload: payload,
    };
  }
}
