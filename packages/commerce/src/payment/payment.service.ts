import { prisma as db } from '@corecart/database';
import { OrderStatus, PaymentStatus, PaymentEventStatus } from "@prisma/client";
import { paymentRegistry } from "./registry";
import { MockProvider } from "./providers/mock.provider";
import { CodProvider } from "./providers/cod.provider";
import { RazorpayProvider } from "./providers/razorpay.provider";
import { IPaymentProvider } from "./types";

// Register provider factories
paymentRegistry.register("MOCK", (config) => new MockProvider(config));
paymentRegistry.register("COD", (config) => new CodProvider(config));
paymentRegistry.register("RAZORPAY", (config) => new RazorpayProvider(config));

export class PaymentService {
  
  async createCheckoutSession(data: any) {
    // Basic Rule Evaluation for COD or other limits
    if (data.paymentMethodCode) {
      const method = await db.paymentMethod.findUnique({
        where: { code: data.paymentMethodCode },
        include: { rules: true }
      });

      if (method && method.rules.length > 0) {
        for (const rule of method.rules) {
          if (rule.minAmount && data.grandTotal < Number(rule.minAmount)) {
            throw new Error(`Minimum amount for ${method.name} is ${rule.minAmount}`);
          }
          if (rule.maxAmount && data.grandTotal > Number(rule.maxAmount)) {
            throw new Error(`Maximum amount for ${method.name} is ${rule.maxAmount}`);
          }
        }
      }
    }

    return await db.checkoutSession.create({
      data: {
        userId: data.userId,
        cartId: data.cartId,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        couponCode: data.couponCode,
        shippingMethod: data.shippingMethod,
        subTotal: data.subTotal,
        taxTotal: data.taxTotal,
        shippingTotal: data.shippingTotal,
        discountTotal: data.discountTotal,
        grandTotal: data.grandTotal,
        paymentMethodCode: data.paymentMethodCode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
      }
    });
  }

  private async resolveProviderInstance(paymentMethodCode: string): Promise<{ provider: IPaymentProvider, providerCode: string }> {
    const method = await db.paymentMethod.findUnique({
      where: { code: paymentMethodCode },
      include: {
        providers: {
          where: { enabled: true },
          orderBy: { priority: 'desc' },
          include: {
            provider: {
              include: { configs: { where: { isActive: true } } }
            }
          }
        }
      }
    });

    if (!method || method.providers.length === 0) {
      // Fallback for mock environment if no DB setup
      if (paymentMethodCode === "MOCK") return { provider: paymentRegistry.resolve("MOCK"), providerCode: "MOCK" };
      if (paymentMethodCode === "COD") return { provider: paymentRegistry.resolve("COD"), providerCode: "COD" };
      throw new Error(`No active provider mapped for payment method: ${paymentMethodCode}`);
    }

    // Pick highest priority provider
    const mapped = method.providers[0];
    const providerRecord = mapped.provider;
    
    // Pass the active config to the factory
    const config = providerRecord.configs[0] || {};
    
    return {
      provider: paymentRegistry.resolve(providerRecord.code, config),
      providerCode: providerRecord.code
    };
  }

  private async resolveProviderByCode(providerCode: string): Promise<IPaymentProvider> {
    const providerRecord = await db.paymentProvider.findUnique({
      where: { code: providerCode },
      include: { configs: { where: { isActive: true } } }
    });
    
    if (!providerRecord) {
      return paymentRegistry.resolve(providerCode); // Try raw factory if DB not populated (tests)
    }

    const config = providerRecord.configs[0] || {};
    return paymentRegistry.resolve(providerRecord.code, config);
  }

  async initializeOrderPayment(sessionId: string) {
    const session = await db.checkoutSession.findUnique({
      where: { id: sessionId },
    });
    
    if (!session) throw new Error("Checkout session not found");
    if (session.expiresAt < new Date()) throw new Error("Checkout session expired");
    
    const methodCode = session.paymentMethodCode || "MOCK";
    
    const { provider, providerCode } = await this.resolveProviderInstance(methodCode);

    // 1. Create Order (PENDING_PAYMENT)
    const orderNumber = `ORD-${Date.now()}`;
    
    let isBusinessOrder = false;
    let gstin = null;
    let companyName = null;
    let cgstDecimal = null;
    let sgstDecimal = null;
    let igstDecimal = null;
    let invoiceType = "RETAIL_INVOICE";
    
    try {
      if (session.shippingAddress) {
        const addrObj = JSON.parse(session.shippingAddress);
        isBusinessOrder = addrObj.isBusiness || false;
        gstin = addrObj.gstin || null;
        companyName = addrObj.companyName || null;
        cgstDecimal = addrObj.cgst !== undefined ? addrObj.cgst : null;
        sgstDecimal = addrObj.sgst !== undefined ? addrObj.sgst : null;
        igstDecimal = addrObj.igst !== undefined ? addrObj.igst : null;
        invoiceType = isBusinessOrder ? "GST_INVOICE" : "RETAIL_INVOICE";
      }
    } catch (e) {
      console.error("Failed to parse shippingAddress JSON during order creation:", e);
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session.userId || "guest",
        checkoutSessionId: session.id,
        subTotal: session.subTotal,
        discountTotal: session.discountTotal,
        taxTotal: session.taxTotal,
        shippingTotal: session.shippingTotal,
        grandTotal: session.grandTotal,
        status: OrderStatus.PENDING_PAYMENT,
        shippingCost: session.shippingTotal,
        shippingProvider: session.shippingMethod,
        couponCode: session.couponCode,
        isBusinessOrder,
        gstin,
        companyName,
        cgstDecimal,
        sgstDecimal,
        igstDecimal,
        invoiceType,
      }
    });

    // 2. Reserve Inventory (Mock logic for now)
    
    // 3. Create Payment record
    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        amount: order.grandTotal,
        paymentMethodCode: methodCode,
        provider: providerCode,
        status: PaymentStatus.PENDING,
      }
    });

    // Immutable Event: CREATED
    await this.logEvent(payment.id, PaymentEventStatus.CREATED, null, null);

    // 4. Initialize with provider
    const initResult = await provider.initializePayment({
      amount: Number(order.grandTotal),
      currency: "USD",
      orderId: order.id,
      paymentId: payment.id,
    });

    // 5. Update Payment with provider info
    await db.payment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: initResult.providerOrderId,
      }
    });
    
    // Immutable Event: AUTHORIZED / PENDING attempt
    await db.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        providerPaymentId: initResult.providerOrderId,
        status: PaymentStatus.PENDING,
      }
    });

    return {
      orderId: order.id,
      paymentId: payment.id,
      ...initResult
    };
  }

  async verifyPayment(orderId: string, paymentId: string, providerPaymentId: string, signature?: string) {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) throw new Error("Payment not found");
    
    const provider = await this.resolveProviderByCode(payment.provider);
    
    const verifyResult = await provider.verifyPayment({
      orderId,
      paymentId,
      providerPaymentId,
      providerOrderId: payment.providerOrderId || undefined,
      signature,
    });

    const newStatus = verifyResult.status;

    // Update Payment
    await db.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        providerPaymentId,
        paidAt: newStatus === PaymentStatus.CAPTURED ? new Date() : null,
      }
    });

    await db.paymentAttempt.create({
      data: {
        paymentId,
        providerPaymentId,
        status: newStatus,
        errorMessage: verifyResult.rawResponse?.error,
      }
    });

    const eventStatus = newStatus === PaymentStatus.CAPTURED ? PaymentEventStatus.SUCCESS : PaymentEventStatus.FAILED;
    await this.logEvent(payment.id, eventStatus, providerPaymentId, verifyResult.rawResponse);

    // Update Order Status based on payment outcome
    const newOrderStatus = newStatus === PaymentStatus.CAPTURED 
      ? OrderStatus.CONFIRMED 
      : OrderStatus.CANCELLED;
      
    await db.order.update({
      where: { id: orderId },
      data: { status: newOrderStatus }
    });

    if (newOrderStatus === OrderStatus.CONFIRMED) {
      // Deduct Inventory here
    } else {
      // Release Inventory here
    }

    return verifyResult;
  }

  async handleWebhook(providerCode: string, rawPayload: string, signature: string) {
    const provider = await this.resolveProviderByCode(providerCode);
    if (!provider.handleWebhook) {
      throw new Error(`Provider ${providerCode} does not support webhooks`);
    }

    const result = await provider.handleWebhook(rawPayload, signature);

    // Idempotency Check
    const existingWebhook = await db.paymentWebhook.findUnique({
      where: { eventId: result.eventId }
    });
    
    if (existingWebhook && existingWebhook.processed) {
      return { status: "already_processed" };
    }

    // Find payment if possible
    let paymentId: string | undefined = undefined;
    if (result.providerPaymentId) {
      const payment = await db.payment.findFirst({
        where: { providerPaymentId: result.providerPaymentId }
      });
      if (payment) paymentId = payment.id;
    }

    await db.paymentWebhook.upsert({
      where: { eventId: result.eventId },
      update: {
        processed: true,
      },
      create: {
        provider: providerCode,
        eventId: result.eventId,
        eventType: result.eventType,
        rawPayload,
        signature,
        processed: true,
        paymentId: paymentId || null,
      }
    });

    if (paymentId) {
      const payment = await db.payment.findUnique({ where: { id: paymentId } });
      if (payment) {
        await db.payment.update({
          where: { id: paymentId },
          data: { status: result.status }
        });
        
        await this.logEvent(paymentId, PaymentEventStatus.WEBHOOK_RECEIVED, result.providerPaymentId || null, JSON.parse(rawPayload));
        
        // Update Order if captured
        if (result.status === PaymentStatus.CAPTURED) {
           await db.order.update({
             where: { id: payment.orderId },
             data: { status: OrderStatus.CONFIRMED }
           });
        }
      }
    }

    return result;
  }

  async cancelPayment(paymentId: string) {
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error("Payment not found");
    
    const provider = await this.resolveProviderByCode(payment.provider);
    if (!provider.cancelPayment) throw new Error("Provider does not support cancel");

    const result = await provider.cancelPayment(payment.providerPaymentId || paymentId);
    
    await db.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.CANCELLED }
    });
    
    await this.logEvent(paymentId, PaymentEventStatus.FAILED, payment.providerPaymentId, result);
    return result;
  }

  private async logEvent(paymentId: string, status: PaymentEventStatus, providerPaymentId: string | null, rawPayload: any) {
    await db.paymentEvent.create({
      data: {
        paymentId,
        status,
        providerPaymentId,
        rawPayload: rawPayload ? JSON.stringify(rawPayload) : null,
      }
    });
  }
}

export const paymentService = new PaymentService();
