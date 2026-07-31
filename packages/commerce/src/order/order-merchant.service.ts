import { prisma } from '@corecart/database';
import { OrderStatus } from '@prisma/client';
import { AppError } from '@corecart/shared';
import { inventoryService } from '../inventory/inventory.service';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface MerchantOrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface MerchantOrderListResult {
  items: MerchantOrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MerchantOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string | null;
  grandTotal: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  couponCode: string | null;
  couponDiscount: number | null;
  shippingProvider: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    name: string | null;
    phone: string | null;
    email: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
  };
  billingAddr: string | null;
  items: MerchantOrderItem[];
  timeline: MerchantOrderTimelineEntry[];
  payment: {
    id: string;
    status: string;
    amount: number;
    provider: string;
    paymentMethodCode: string;
    paidAt: string | null;
  } | null;
  notes: MerchantOrderNote[];
}

export interface MerchantOrderItem {
  id: string;
  productName: string;
  brandName: string | null;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  totalPrice: number;
  variantId: string | null;
}

export interface MerchantOrderTimelineEntry {
  id: string;
  status: string;
  message: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface MerchantOrderNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const orderMerchantService = {

  // ── Listing ──────────────────────────────────

  async listOrders(params: MerchantOrderListParams): Promise<MerchantOrderListResult> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = {};

    if (params.status) {
      where.status = params.status as OrderStatus;
    }

    if (params.paymentStatus) {
      where.payment = { status: params.paymentStatus };
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo)   where.createdAt.lte = new Date(params.dateTo);
    }

    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search } },
        { shippingName: { contains: params.search } },
        { shippingEmail: { contains: params.search } },
        { user: { email: { contains: params.search } } },
        { user: { firstName: { contains: params.search } } },
      ];
    }

    const sortField = params.sortField ?? 'createdAt';
    const sortDir = params.sortDir ?? 'desc';
    const validSortFields = ['createdAt', 'updatedAt', 'grandTotal', 'status', 'orderNumber'];
    const orderBy = validSortFields.includes(sortField)
      ? { [sortField]: sortDir }
      : { createdAt: 'desc' as const };

    const [rawOrders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          items: { select: { id: true } },
          payment: { select: { status: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const items: MerchantOrderSummary[] = rawOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.shippingName ?? `${o.user.firstName} ${o.user.lastName ?? ''}`.trim(),
      customerEmail: o.shippingEmail ?? o.user.email,
      status: o.status,
      paymentStatus: o.payment?.status ?? null,
      grandTotal: Number(o.grandTotal),
      itemCount: o.items.length,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Detail ───────────────────────────────────

  async getOrderDetail(orderId: string): Promise<MerchantOrderDetail> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: true,
        payment: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new AppError('Order not found', 404);

    // Fetch notes from timeline entries where createdBy starts with "NOTE:"
    const notes: MerchantOrderNote[] = order.timeline
      .filter((t) => t.createdBy?.startsWith('NOTE:'))
      .map((t) => ({
        id: t.id,
        content: t.message ?? '',
        createdBy: t.createdBy?.replace('NOTE:', '') ?? 'Merchant',
        createdAt: t.createdAt.toISOString(),
      }));

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subTotal: Number(order.subTotal),
      discountTotal: Number(order.discountTotal),
      taxTotal: Number(order.taxTotal),
      shippingTotal: Number(order.shippingTotal),
      grandTotal: Number(order.grandTotal),
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount ? Number(order.couponDiscount) : null,
      shippingProvider: order.shippingProvider,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      customer: {
        id: order.user.id,
        name: `${order.user.firstName} ${order.user.lastName ?? ''}`.trim(),
        email: order.user.email,
        phone: order.user.phone ?? null,
      },
      shippingAddress: {
        name: order.shippingName,
        phone: order.shippingPhone,
        email: order.shippingEmail,
        street: order.shippingStreet,
        city: order.shippingCity,
        state: order.shippingState,
        country: order.shippingCountry,
        postalCode: order.shippingPostalCode,
      },
      billingAddr: order.billingAddr,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        brandName: item.brandName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        tax: Number(item.tax),
        totalPrice: Number(item.totalPrice),
        variantId: item.variantId,
      })),
      timeline: order.timeline
        .filter((t) => !t.createdBy?.startsWith('NOTE:'))
        .map((t) => ({
          id: t.id,
          status: t.status,
          message: t.message,
          createdBy: t.createdBy,
          createdAt: t.createdAt.toISOString(),
        })),
      payment: order.payment
        ? {
            id: order.payment.id,
            status: order.payment.status,
            amount: Number(order.payment.amount),
            provider: order.payment.provider,
            paymentMethodCode: order.payment.paymentMethodCode,
            paidAt: order.payment.paidAt?.toISOString() ?? null,
          }
        : null,
      notes,
    };
  },

  // ── Status Update ────────────────────────────

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note: string | undefined,
    actor: string,
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);

    const previous = order.status;
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: newStatus,
        message: note ?? `Status changed from ${previous} to ${newStatus}`,
        createdBy: actor,
      },
    });

    return updated;
  },

  // ── Fulfillment ──────────────────────────────

  async fulfillOrder(
    orderId: string,
    action: 'PACK' | 'MARK_READY' | 'SHIP' | 'DELIVER' | 'CANCEL',
    payload: {
      trackingNumber?: string;
      shippingProvider?: string;
      estimatedDelivery?: string;
      note?: string;
      actor?: string;
    },
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);

    const actor = payload.actor ?? 'MERCHANT';
    let newStatus: OrderStatus | null = null;
    let message = '';

    switch (action) {
      case 'PACK':
        newStatus = OrderStatus.PACKED;
        message = payload.note ?? 'Order packed and ready for pickup';
        break;
      case 'MARK_READY':
        newStatus = OrderStatus.PACKED;
        message = payload.note ?? 'Marked as ready for dispatch';
        break;
      case 'SHIP':
        newStatus = OrderStatus.SHIPPED;
        message = payload.note ?? `Shipment created${payload.trackingNumber ? ` — Tracking: ${payload.trackingNumber}` : ''}`;
        break;
      case 'DELIVER':
        newStatus = OrderStatus.DELIVERED;
        message = payload.note ?? 'Order marked as delivered';
        break;
      case 'CANCEL':
        newStatus = OrderStatus.CANCELLED;
        message = payload.note ?? 'Fulfillment cancelled by merchant';
        break;
    }

    const updateData: any = {};
    if (newStatus) updateData.status = newStatus;
    if (payload.trackingNumber) updateData.trackingNumber = payload.trackingNumber;
    if (payload.shippingProvider) updateData.shippingProvider = payload.shippingProvider;
    if (payload.estimatedDelivery) updateData.estimatedDelivery = payload.estimatedDelivery;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    if (newStatus) {
      await prisma.orderTimeline.create({
        data: { orderId, status: newStatus, message, createdBy: actor },
      });
    }

    // Release inventory when order is cancelled by merchant
    if (action === 'CANCEL') {
      const items = await prisma.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        if (item.variantId) {
          try {
            await inventoryService.release(
              item.variantId,
              item.quantity,
              orderId,
              'Released — order cancelled by merchant'
            );
          } catch (err: any) {
            console.error(`[Inventory] Release failed for variant ${item.variantId}:`, err.message);
          }
        }
      }
    }

    return updated;
  },

  // ── Notes ────────────────────────────────────

  async addNote(orderId: string, content: string, author: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!order) throw new AppError('Order not found', 404);

    const entry = await prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'NOTE',
        message: content,
        createdBy: `NOTE:${author}`,
      },
    });

    return {
      id: entry.id,
      content,
      createdBy: author,
      createdAt: entry.createdAt.toISOString(),
    };
  },

  // ── Refund ───────────────────────────────────

  async initiateRefund(orderId: string, amount: number, reason: string, actor: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (!order.payment) throw new AppError('No payment found for this order', 400);

    // Create a return record first
    const returnRecord = await prisma.return.create({
      data: {
        orderId,
        reason,
        status: 'APPROVED',
      },
    });

    // Create refund record
    await prisma.refund.create({
      data: {
        returnId: returnRecord.id,
        paymentId: order.payment.id,
        amount,
        status: 'REFUND_PENDING',
        reason,
      },
    });

    // Update order status to REFUNDED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.REFUNDED },
    });

    // Timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'REFUNDED',
        message: `Refund of ₹${amount} initiated — Reason: ${reason}`,
        createdBy: actor,
      },
    });

    return { success: true };
  },

  // ── COD Payment Collection ───────────────────

  async markCodPaymentCollected(orderId: string, actor: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw new AppError('Order not found', 404);

    const payment = order.payment;
    if (!payment) throw new AppError('No payment record found for this order', 400);

    // Guard: only for COD
    if (payment.paymentMethodCode !== 'COD') {
      throw new AppError('markCodPaymentCollected is only valid for Cash on Delivery orders', 400);
    }

    // Guard: only if still pending (prevent double-collection)
    if (payment.status !== 'PENDING') {
      throw new AppError(
        `Payment is already in status ${payment.status}. Cannot mark as collected again.`,
        400
      );
    }

    // Mark payment as captured (cash received)
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        paidAt: new Date(),
      },
    });

    // Timeline event: who collected, when
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'PAYMENT_COLLECTED',
        message: `Cash on Delivery payment collected by ${actor}`,
        createdBy: actor,
      },
    });

    return { success: true, collectedBy: actor, collectedAt: new Date().toISOString() };
  },

  // ── Bulk Actions ─────────────────────────────

  async bulkUpdateStatus(orderIds: string[], status: OrderStatus, actor: string) {
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status },
    });

    await prisma.orderTimeline.createMany({
      data: orderIds.map((orderId) => ({
        orderId,
        status,
        message: `Bulk status update to ${status}`,
        createdBy: actor,
      })),
    });

    return { updated: orderIds.length };
  },

  // ── Stats for filter counts ───────────────────

  async getOrderStatusCounts() {
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const result: Record<string, number> = {};
    for (const c of counts) {
      result[c.status] = c._count.id;
    }
    return result;
  },
};
