'use server';

import { MerchantInventoryService } from '@corecart/commerce/src/catalog/merchant-inventory.service';
import { revalidatePath } from 'next/cache';

export async function fetchInventoryAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: boolean;
}) {
  try {
    const data = await MerchantInventoryService.listMerchantInventory(params);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch inventory' };
  }
}

export async function adjustInventoryAction(
  variantId: string,
  input: {
    adjustType: 'INCREASE' | 'DECREASE' | 'SET';
    quantity: number;
    reason: 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'OTHER';
    notes?: string;
    lowStockThreshold?: number;
  }
) {
  try {
    await MerchantInventoryService.adjustVariantInventory(variantId, input);
    revalidatePath('/inventory');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to adjust inventory' };
  }
}

export async function fetchInventoryHistoryAction(variantId: string) {
  try {
    const data = await MerchantInventoryService.getInventoryHistory(variantId);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch inventory history' };
  }
}
