import {
  fetchOrdersAction,
  fetchOrderDetailAction,
  fetchOrderStatusCountsAction,
  updateOrderStatusAction,
  fulfillOrderAction,
  addOrderNoteAction,
  initiateRefundAction,
  bulkUpdateOrderStatusAction,
  markCodPaymentCollectedAction,
} from '@/app/orders/actions';
import type { MerchantOrderListParams } from '@corecart/commerce';
import type { OrderStatus } from '@prisma/client';

export class MerchantOrderClient {
  static async listOrders(params: MerchantOrderListParams) {
    const res = await fetchOrdersAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getOrderDetail(orderId: string) {
    const res = await fetchOrderDetailAction(orderId);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getStatusCounts() {
    const res = await fetchOrderStatusCountsAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateStatus(orderId: string, status: OrderStatus, note?: string) {
    const res = await updateOrderStatusAction(orderId, status, note);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async fulfillOrder(
    orderId: string,
    action: 'PACK' | 'MARK_READY' | 'SHIP' | 'DELIVER' | 'CANCEL',
    payload: {
      trackingNumber?: string;
      shippingProvider?: string;
      estimatedDelivery?: string;
      note?: string;
    } = {},
  ) {
    const res = await fulfillOrderAction(orderId, action, payload);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async addNote(orderId: string, content: string, author?: string) {
    const res = await addOrderNoteAction(orderId, content);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async initiateRefund(orderId: string, amount: number, reason: string) {
    const res = await initiateRefundAction(orderId, amount, reason);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async bulkUpdateStatus(orderIds: string[], status: OrderStatus) {
    const res = await bulkUpdateOrderStatusAction(orderIds, status);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async markCodPaymentCollected(orderId: string) {
    const res = await markCodPaymentCollectedAction(orderId);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }
}
