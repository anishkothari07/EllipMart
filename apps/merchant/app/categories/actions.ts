'use server';

import { MerchantCategoryService } from '@corecart/commerce/src/catalog/merchant-category.service';
import { requireMerchantAccess } from '@corecart/shared/src/auth';
import { revalidatePath } from 'next/cache';

export async function fetchCategoryTreeAction() {
  try {
    await requireMerchantAccess();
    const data = await MerchantCategoryService.listCategoriesTree();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch categories tree' };
  }
}

export async function fetchCategoryByIdAction(id: string) {
  try {
    await requireMerchantAccess();
    const data = await MerchantCategoryService.getCategory(id);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch category' };
  }
}

export async function createCategoryAction(input: any) {
  try {
    await requireMerchantAccess();
    const data = await MerchantCategoryService.createCategory(input);
    revalidatePath('/categories');
    revalidatePath('/products');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: string, input: any) {
  try {
    await requireMerchantAccess();
    await MerchantCategoryService.updateCategory(id, input);
    revalidatePath('/categories');
    revalidatePath(`/categories/${id}`);
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update category' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireMerchantAccess();
    await MerchantCategoryService.deleteCategory(id);
    revalidatePath('/categories');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete category' };
  }
}

export async function moveCategoryAction(id: string, parentId: string | null, sortOrder: number) {
  try {
    await requireMerchantAccess();
    await MerchantCategoryService.moveCategory(id, parentId, sortOrder);
    revalidatePath('/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to move category' };
  }
}
