import {
  fetchInventoryAction,
  adjustInventoryAction,
  fetchInventoryHistoryAction,
} from '@/app/inventory/actions';

export class MerchantInventoryClient {
  static async listInventory(params: {
    page?: number;
    limit?: number;
    search?: string;
    lowStockOnly?: boolean;
  }) {
    const res = await fetchInventoryAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async adjustInventory(
    variantId: string,
    input: {
      adjustType: 'INCREASE' | 'DECREASE' | 'SET';
      quantity: number;
      reason: 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'OTHER';
      notes?: string;
      lowStockThreshold?: number;
    }
  ) {
    const res = await adjustInventoryAction(variantId, input);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async getHistory(variantId: string) {
    const res = await fetchInventoryHistoryAction(variantId);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }
}
