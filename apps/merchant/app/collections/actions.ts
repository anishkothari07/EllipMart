'use server';

import { MerchantCollectionService } from '@corecart/commerce/src/catalog/merchant-collection.service';
import { revalidatePath } from 'next/cache';

export async function fetchCollectionsAction(params: { page?: number; limit?: number; search?: string }) {
  try {
    const data = await MerchantCollectionService.listCollections(params);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch collections' };
  }
}

export async function fetchCollectionByIdAction(id: string) {
  try {
    const data = await MerchantCollectionService.getCollection(id);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch collection' };
  }
}

export async function createCollectionAction(input: any) {
  try {
    const data = await MerchantCollectionService.createCollection(input);
    revalidatePath('/collections');
    revalidatePath('/products');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create collection' };
  }
}

export async function updateCollectionAction(id: string, input: any) {
  try {
    await MerchantCollectionService.updateCollection(id, input);
    revalidatePath('/collections');
    revalidatePath(`/collections/${id}`);
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update collection' };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    await MerchantCollectionService.deleteCollection(id);
    revalidatePath('/collections');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete collection' };
  }
}

export async function bulkAssignCollectionAction(colId: string, productIds: string[], operation: 'REPLACE' | 'APPEND' | 'REMOVE') {
  try {
    await MerchantCollectionService.bulkAssignProducts(colId, productIds, operation);
    revalidatePath('/collections');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk assign products' };
  }
}

export async function bulkAssignCategoryAction(catId: string, productIds: string[], operation: 'REPLACE' | 'APPEND' | 'REMOVE') {
  try {
    await MerchantCollectionService.bulkAssignCategories(catId, productIds, operation);
    revalidatePath('/categories');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk assign categories' };
  }
}
