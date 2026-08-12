import { prisma } from '@corecart/database';
import { OrderStatus } from '@corecart/database';
import { notificationService } from '../notification/notification.service';
import { AppError, NotFoundError, ForbiddenError, ValidationError } from '@corecart/shared';
import { loyaltyService } from '../loyalty/loyalty.service';
import { walletService } from '../wallet/wallet.service';

export const orderService = {
  async createOrder(data: any) {
    const order = await prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        checkoutSessionId: data.checkoutSessionId,
        subTotal: data.subTotal,
        discountTotal: data.discountTotal,
        taxTotal: data.taxTotal,
        shippingTotal: data.shippingTotal,
        grandTotal: data.grandTotal,
        status: data.status || OrderStatus.PENDING_PAYMENT,

        // GST / Business billing
        isBusinessOrder: data.isBusinessOrder || false,
        gstin: data.gstin ?? null,
        companyName: data.companyName ?? null,
        invoiceType: data.invoiceType ?? null,
        cgstDecimal: data.cgstDecimal ?? null,
        sgstDecimal: data.sgstDecimal ?? null,
        igstDecimal: data.igstDecimal ?? null,

        // Address Snapshots
        shippingName: data.shippingName,
        shippingPhone: data.shippingPhone,
        shippingEmail: data.shippingEmail,
        shippingStreet: data.shippingStreet,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingCountry: data.shippingCountry,
        shippingPostalCode: data.shippingPostalCode,
        billingAddr: data.billingAddr,

        // Coupon Snapshot
        couponCode: data.couponCode,
        discountType: data.discountType,
        discountValue: data.discountValue,
        couponDiscount: data.couponDiscount,

        // Shipping Snapshot
        shippingProvider: data.shippingProvider,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        shippingCost: data.shippingCost,

        // Payment is now managed separately through Payment model

        items: {
          create: data.items.map((item: any) => ({
            variantId: item.variantId,
            productName: item.productName,
            brandName: item.brandName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: { items: true, user: true }
    });

    await this.addTimelineEvent(order.id, order.status, 'Order created successfully', 'SYSTEM');

    notificationService.emit('OrderCreated', {
      orderId: order.id,
      userId: order.userId,
      email: order.user.email,
      firstName: order.user.firstName,
      orderNumber: order.orderNumber
    });

    return order;
  },

  async addTimelineEvent(orderId: string, status: string, message?: string, createdBy?: string) {
    return await prisma.orderTimeline.create({
      data: {
        orderId,
        status,
        message,
        createdBy
      }
    });
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, message?: string, createdBy: string = 'SYSTEM') {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { user: true }
    });

    await this.addTimelineEvent(order.id, newStatus, message, createdBy);

    if (newStatus === OrderStatus.CONFIRMED) {
      notificationService.emit('OrderPaid', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber
      });
    }

    if (newStatus === OrderStatus.SHIPPED) {
      notificationService.emit('ShipmentCreated', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber || ''
      });
    }

    if (newStatus === OrderStatus.DELIVERED) {
      notificationService.emit('ShipmentDelivered', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber
      });

      // ── Earn loyalty points (idempotent) ────────────────────────────────────────
      // Eligible amount = merchandise value only (unitPrice × qty, before discounts)
      // Excludes: shipping, tax, wallet deduction, redeemed points
      try {
        const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
        const eligibleAmount = orderItems.reduce(
          (sum, item) => sum + Number(item.unitPrice) * item.quantity,
          0,
        );
        await loyaltyService.earnPoints(order.userId, eligibleAmount, order.id);
        await loyaltyService.processReferralFirstOrder(order.userId);
      } catch (err: any) {
        console.error('[OrderService] Loyalty earn / referral processing failed:', err.message);
      }
    }

    if (newStatus === OrderStatus.CANCELLED) {
      notificationService.emit('OrderCancelled', {
        orderId: order.id,
        userId: order.userId,
        email: order.user.email,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber
      });
    }

    return order;
  },

  async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, timeline: { orderBy: { createdAt: 'desc' } } }
    });
    
    if (!order) throw new NotFoundError('Order not found');
    if (userId && order.userId !== userId) throw new ForbiddenError('Unauthorized access to order');
    
    return order;
  },

  async getOrdersByUser(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true }
    });

    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Unauthorized access to order');

    const cancellableStatuses: string[] = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new ValidationError(`Order cannot be cancelled in its current status (${order.status})`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED }
    });

    await this.addTimelineEvent(orderId, OrderStatus.CANCELLED, 'Order cancelled by customer', 'CUSTOMER');

    // Restore inventory based on what stage it was at
    const { inventoryService } = await import('../inventory/inventory.service');
    for (const item of order.items) {
      if (item.variantId) {
        try {
          if (order.status === 'PENDING_PAYMENT') {
            // Inventory is still reserved (not yet sold); release the reservation
            await inventoryService.release(
              item.variantId,
              item.quantity,
              orderId,
              'Released — order cancelled before confirmation'
            );
          } else {
            // CONFIRMED, PROCESSING, PACKED — inventory was sold via sale()
            // Reverse the sale to restore available quantity
            await inventoryService.unsale(
              item.variantId,
              item.quantity,
              orderId,
              'Reversed sale — order cancelled after confirmation'
            );
          }
        } catch (err: any) {
          console.error(`[Inventory] Restore failed for variant ${item.variantId}:`, err.message);
        }
      }
    }

    notificationService.emit('OrderCancelled', {
      orderId: order.id,
      userId: order.userId,
      email: order.user.email,
      firstName: order.user.firstName,
      orderNumber: order.orderNumber
    });

    // ── Wallet refund ────────────────────────────────────────────────────────────
    // Only the wallet-funded portion goes back to wallet.
    // The Razorpay-funded portion is handled separately by refund.service.ts.
    const freshOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (freshOrder?.walletAmountUsed && Number(freshOrder.walletAmountUsed) > 0) {
      try {
        await walletService.refund(
          userId,
          Number(freshOrder.walletAmountUsed),
          orderId,
          `Refund for cancelled order #${order.orderNumber}`,
        );
      } catch (err: any) {
        console.error('[OrderService] Wallet refund failed:', err.message);
      }
    }

    // ── Loyalty points restore ─────────────────────────────────────────────────
    // Restore redeemed points as an ADJUSTMENT (immutable ledger).
    if (freshOrder?.pointsRedeemed && freshOrder.pointsRedeemed > 0) {
      try {
        await loyaltyService.adminAdjust(
          userId,
          freshOrder.pointsRedeemed,
          `Points restored — order #${order.orderNumber} cancelled`,
        );
      } catch (err: any) {
        console.error('[OrderService] Loyalty points restore failed:', err.message);
      }
    }

    return { success: true };
  }
};
