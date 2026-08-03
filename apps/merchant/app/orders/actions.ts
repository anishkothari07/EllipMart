'use server';

import { OrderStatus } from '@prisma/client';
import { orderMerchantService, MerchantOrderListParams } from '@corecart/commerce/src/order/order-merchant.service';
import { requireMerchantAccess } from '@corecart/shared/src/auth';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────

export async function fetchOrdersAction(params: MerchantOrderListParams) {
  try {
    await requireMerchantAccess();
    const data = await orderMerchantService.listOrders(params);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch orders' };
  }
}

export async function fetchOrderStatusCountsAction() {
  try {
    await requireMerchantAccess();
    const data = await orderMerchantService.getOrderStatusCounts();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch status counts' };
  }
}

// ─────────────────────────────────────────────
// DETAIL
// ─────────────────────────────────────────────

export async function fetchOrderDetailAction(orderId: string) {
  try {
    await requireMerchantAccess();
    const data = await orderMerchantService.getOrderDetail(orderId);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch order' };
  }
}

// ─────────────────────────────────────────────
// STATUS UPDATE
// ─────────────────────────────────────────────

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  note?: string,
) {
  try {
    const user = await requireMerchantAccess();
    const actor = `${user.firstName} ${user.lastName} (Merchant)`;
    await orderMerchantService.updateOrderStatus(orderId, status, note, actor);
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

// ─────────────────────────────────────────────
// FULFILLMENT
// ─────────────────────────────────────────────

export async function fulfillOrderAction(
  orderId: string,
  action: 'PACK' | 'MARK_READY' | 'SHIP' | 'DELIVER' | 'CANCEL',
  payload: {
    trackingNumber?: string;
    shippingProvider?: string;
    estimatedDelivery?: string;
    note?: string;
  },
) {
  try {
    const user = await requireMerchantAccess();
    const actor = `${user.firstName} ${user.lastName} (Merchant)`;
    await orderMerchantService.fulfillOrder(orderId, action, { ...payload, actor });
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Fulfillment action failed' };
  }
}

// ─────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────

export async function addOrderNoteAction(orderId: string, content: string) {
  try {
    const user = await requireMerchantAccess();
    const authorName = `${user.firstName} ${user.lastName} (Merchant)`;
    const note = await orderMerchantService.addNote(orderId, content, authorName);
    revalidatePath(`/orders/${orderId}`);
    return { success: true, data: JSON.parse(JSON.stringify(note)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add note' };
  }
}

// ─────────────────────────────────────────────
// REFUND
// ─────────────────────────────────────────────

export async function initiateRefundAction(
  orderId: string,
  amount: number,
  reason: string,
) {
  try {
    const user = await requireMerchantAccess();
    const actor = `${user.firstName} ${user.lastName} (Merchant)`;
    await orderMerchantService.initiateRefund(orderId, amount, reason, actor);
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to initiate refund' };
  }
}

// ─────────────────────────────────────────────
// BULK
// ─────────────────────────────────────────────

export async function bulkUpdateOrderStatusAction(
  orderIds: string[],
  status: OrderStatus,
) {
  try {
    const user = await requireMerchantAccess();
    const actor = `${user.firstName} ${user.lastName} (Merchant)`;
    const result = await orderMerchantService.bulkUpdateStatus(orderIds, status, actor);
    revalidatePath('/orders');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Bulk update failed' };
  }
}

// ─────────────────────────────────────────────
// COD PAYMENT COLLECTION
// ─────────────────────────────────────────────

export async function markCodPaymentCollectedAction(orderId: string) {
  try {
    const user = await requireMerchantAccess();
    const actor = `${user.firstName} ${user.lastName} (Merchant)`;
    const result = await orderMerchantService.markCodPaymentCollected(orderId, actor);
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark payment collected' };
  }
}
