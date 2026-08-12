import { prisma as db } from '@corecart/database';
import { OrderStatus, PaymentStatus, PaymentEventStatus } from "@prisma/client";
import { AppError } from '@corecart/shared';
import { paymentRegistry } from "./registry";
import { MockProvider } from "./providers/mock.provider";
import { CodProvider } from "./providers/cod.provider";
import { RazorpayProvider } from "./providers/razorpay.provider";
import { IPaymentProvider } from "./types";
import { orderService } from '../order/order.service';
import { inventoryService } from '../inventory/inventory.service';
import { checkoutWalletService } from '../checkout/checkout-wallet.service';
import { checkoutLoyaltyService } from '../checkout/checkout-loyalty.service';

// Register provider factories
paymentRegistry.register("MOCK", (config) => new MockProvider(config));
paymentRegistry.register("COD", (config) => new CodProvider(config));
paymentRegistry.register("INTERNAL", (config) => new CodProvider(config));
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
        id: data.id, // Support deterministic session ID
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

    // Idempotency: Check if Order already exists for this session
    const existingOrder = await db.order.findUnique({
      where: { checkoutSessionId: sessionId },
      include: { payment: true }
    });
    if (existingOrder) {
      const payment = existingOrder.payment;
      if (payment) {
        const attempt = await db.paymentAttempt.findFirst({
          where: { paymentId: payment.id },
          orderBy: { createdAt: 'desc' }
        });
        return {
          orderId: existingOrder.id,
          paymentId: payment.id,
          providerOrderId: payment.providerOrderId || attempt?.providerPaymentId || `rzp_mock_${existingOrder.id}`,
          clientSecret: payment.id,
        };
      }
    }

    const methodCode = session.paymentMethodCode || "MOCK";

    const { provider, providerCode } = await this.resolveProviderInstance(methodCode);

    // 1. Parse address snapshot
    const orderNumber = `ORD-${Date.now()}`;
    let isBusinessOrder = false;
    let gstin: string | null = null;
    let companyName: string | null = null;
    let cgstDecimal: number | null = null;
    let sgstDecimal: number | null = null;
    let igstDecimal: number | null = null;
    let invoiceType = "RETAIL_INVOICE";
    let addrObj: any = null;

    try {
      if (session.shippingAddress) {
        addrObj = JSON.parse(session.shippingAddress);
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

    // 2. Fetch cart items to build order items snapshot
    if (!session.cartId) {
      throw new AppError('Cannot create order from session without cartId', 400);
    }
    const cartItems = await db.cartItem.findMany({
      where: { cartId: session.cartId, isSaved: false },
      include: {
        variant: {
          include: {
            pricing: true,
            product: {
              include: { brand: true }
            }
          }
        }
      }
    });

    const orderItemsData = cartItems.map((item) => {
      const unitPrice = Number(item.variant?.pricing?.sellingPrice || 0);
      const totalPrice = unitPrice * item.quantity;
      return {
        variantId: item.variantId,
        productName: item.variant?.product?.name || item.variant?.name || 'Unknown Product',
        brandName: item.variant?.product?.brand?.name ?? null,
        sku: item.variant?.sku || 'UNKNOWN-SKU',
        quantity: item.quantity,
        unitPrice,
        discount: 0,
        tax: 0,
        totalPrice,
      };
    });

    try {
      // 3. Create Order + OrderItems atomically via orderService
      const order = await orderService.createOrder({
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
        // Address snapshot (flat fields)
        shippingName: addrObj?.fullName ?? null,
        shippingPhone: addrObj?.phone ?? null,
        shippingEmail: addrObj?.email ?? null,
        shippingStreet: addrObj?.street ?? null,
        shippingCity: addrObj?.city ?? null,
        shippingState: addrObj?.state ?? null,
        shippingCountry: addrObj?.country ?? null,
        shippingPostalCode: addrObj?.postalCode ?? null,
        billingAddr: session.billingAddress,
        items: orderItemsData,
      });

      // 4. Reserve inventory for each item
      for (const item of orderItemsData) {
        if (item.variantId) {
          try {
            await inventoryService.reserve(
              item.variantId,
              item.quantity,
              order.id,
              `Reserved for order ${orderNumber}`
            );
          } catch (err: any) {
            console.error(`[Inventory] Reserve failed for variant ${item.variantId}:`, err.message);
          }
        }
      }

      // 5. Create Payment record
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

      // 6. Initialize with provider
      const initResult = await provider.initializePayment({
        amount: Number(order.grandTotal),
        currency: "INR",
        orderId: order.id,
        paymentId: payment.id,
      });

      // 7. Update Payment with provider info
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

    } catch (err: any) {
      // In case of concurrent uniqueness conflict, retrieve the winning request's order
      if (err.code === 'P2002' || err.message?.includes('Unique constraint')) {
        const winningOrder = await db.order.findUnique({
          where: { checkoutSessionId: session.id },
          include: { payment: true }
        });
        if (winningOrder && winningOrder.payment) {
          const attempt = await db.paymentAttempt.findFirst({
            where: { paymentId: winningOrder.payment.id },
            orderBy: { createdAt: 'desc' }
          });
          return {
            orderId: winningOrder.id,
            paymentId: winningOrder.payment.id,
            providerOrderId: winningOrder.payment.providerOrderId || attempt?.providerPaymentId || `rzp_mock_${winningOrder.id}`,
            clientSecret: winningOrder.payment.id,
          };
        }
      }
      throw err;
    }
  }

  /**
   * COD-specific order acceptance path.
   * Confirms the order (PENDING_PAYMENT → CONFIRMED) while keeping
   * payment status as PENDING — cash is collected on delivery.
   * Converts reserved inventory to sold inventory exactly once.
   */
  async confirmCodOrder(orderId: string, paymentId: string) {
    const orderCheck = await db.order.findUnique({ where: { id: orderId } });
    if (orderCheck && orderCheck.status === OrderStatus.CONFIRMED) {
      return; // Already confirmed, return immediately to ensure idempotency
    }

    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('Payment not found for COD order');
    if (payment.paymentMethodCode !== 'COD') {
      throw new Error('confirmCodOrder called on a non-COD payment method');
    }

    // Payment stays PENDING — cash not yet collected
    // Log a COD_ACCEPTED event for auditability
    await this.logEvent(paymentId, PaymentEventStatus.AUTHORIZED, `cod_accepted_${orderId}`, {
      message: 'COD order accepted — payment to be collected on delivery'
    });

    // Confirm the order
    await orderService.updateOrderStatus(
      orderId,
      OrderStatus.CONFIRMED,
      'COD order confirmed — payment to be collected on delivery',
      'SYSTEM'
    );

    // Convert reserved inventory → sold (exactly once for COD acceptance)
    const orderItems = await db.orderItem.findMany({ where: { orderId } });
    for (const item of orderItems) {
      if (item.variantId) {
        try {
          await inventoryService.sale(
            item.variantId,
            item.quantity,
            orderId,
            `Sale confirmed — COD order ${orderId} accepted`
          );
        } catch (err: any) {
          console.error(`[Inventory] COD sale failed for variant ${item.variantId}:`, err.message);
        }
      }
    }

    return { confirmed: true, orderId, paymentStatus: 'PENDING', paymentMethod: 'COD' };
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
    // Only online payment verification reaches here. COD uses confirmCodOrder() instead.
    let newOrderStatus: OrderStatus;
    if (newStatus === PaymentStatus.CAPTURED) {
      newOrderStatus = OrderStatus.CONFIRMED;
    } else {
      newOrderStatus = OrderStatus.CANCELLED;
    }

    await orderService.updateOrderStatus(
      orderId,
      newOrderStatus,
      newOrderStatus === OrderStatus.CONFIRMED
        ? `Payment captured — order confirmed`
        : `Payment failed — order cancelled`,
      'SYSTEM'
    );

    // Fetch order items for inventory operations
    const orderItems = await db.orderItem.findMany({ where: { orderId } });

    // Fetch CheckoutSession so we can finalize wallet/loyalty holds by sessionId
    const orderRecord = await db.order.findUnique({
      where: { id: orderId },
      select: { checkoutSessionId: true },
    });
    const sessionId = orderRecord?.checkoutSessionId;

    if (newOrderStatus === OrderStatus.CONFIRMED) {
      // ── Finalize wallet + loyalty holds ─────────────────────────────
      if (sessionId) {
        try {
          const walletTx = await checkoutWalletService.finalizeWallet(sessionId, orderId);
          const loyaltyTx = await checkoutLoyaltyService.finalizeLoyalty(sessionId, orderId);

          // Store payment allocation on the order so refund logic knows the split
          await db.order.update({
            where: { id: orderId },
            data: {
              walletAmountUsed: walletTx ? Math.abs(Number(walletTx.amount)) : null,
              pointsRedeemed: loyaltyTx ? Math.abs(loyaltyTx.points) : null,
              pointsMonetaryValue: loyaltyTx ? Number(loyaltyTx.monetaryValue) : null,
            },
          });
        } catch (err: any) {
          // Non-fatal — log and continue; inventory and order status already updated
          console.error('[PaymentVerify] Wallet/Loyalty finalize failed:', err.message);
        }
      }

      // Convert reserved stock to sold stock
      for (const item of orderItems) {
        if (item.variantId) {
          try {
            await inventoryService.sale(
              item.variantId,
              item.quantity,
              orderId,
              `Sale confirmed for order ${orderId}`
            );
          } catch (err: any) {
            console.error(`[Inventory] Sale failed for variant ${item.variantId}:`, err.message);
          }
        }
      }
    } else {
      // ── Release wallet + loyalty holds on payment failure ────────────
      if (sessionId) {
        try {
          await checkoutWalletService.releaseWallet(sessionId);
          await checkoutLoyaltyService.releaseLoyalty(sessionId);
        } catch (err: any) {
          console.error('[PaymentVerify] Hold release failed:', err.message);
        }
      }

      // Release reserved stock because payment failed
      for (const item of orderItems) {
        if (item.variantId) {
          try {
            await inventoryService.release(
              item.variantId,
              item.quantity,
              orderId,
              `Released — payment failed for order ${orderId}`
            );
          } catch (err: any) {
            console.error(`[Inventory] Release failed for variant ${item.variantId}:`, err.message);
          }
        }
      }
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
