'use server';

import { MerchantInventoryService } from '@corecart/commerce/src/catalog/merchant-inventory.service';
import { requireSellerAccess } from '@corecart/shared/src/auth';
import { revalidatePath } from 'next/cache';

export async function fetchInventoryAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: boolean;
}) {
  try {
    const user = await requireSellerAccess();
    const data = await MerchantInventoryService.listMerchantInventory({ ...params, sellerId: user.id });
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
    // Verify access (seller ownership is enforced via variantId -> product -> sellerId in the service layer)
    await requireSellerAccess();
    await MerchantInventoryService.adjustVariantInventory(variantId, input);
    revalidatePath('/seller/inventory');
    revalidatePath('/seller/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to adjust inventory' };
  }
}

export async function fetchInventoryHistoryAction(variantId: string) {
  try {
    await requireSellerAccess();
    const data = await MerchantInventoryService.getInventoryHistory(variantId);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch inventory history' };
  }
}
