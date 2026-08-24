'use server';

import { MerchantProductService } from '@corecart/commerce/src/catalog/merchant-product.service';
import { requireAdminAccess } from '@corecart/shared/src/auth';
import { prisma } from '@corecart/database';
import { revalidatePath } from 'next/cache';

export async function fetchProductsAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  sort?: string;
}) {
  try {
    await requireAdminAccess();
    const data = await MerchantProductService.listMerchantProducts({
      ...params,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch products' };
  }
}

export async function fetchProductByIdAction(id: string) {
  try {
    await requireAdminAccess();
    const data = await MerchantProductService.getMerchantProduct(id);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch product' };
  }
}

export async function fetchBrandsAndCategoriesAction() {
  try {
    await requireAdminAccess();
    const [brands, categories, collections] = await Promise.all([
      prisma.brand.findMany({ select: { id: true, name: true } }),
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.collection.findMany({ select: { id: true, name: true } }),
    ]);

    return {
      success: true,
      data: {
        brands: JSON.parse(JSON.stringify(brands)),
        categories: JSON.parse(JSON.stringify(categories)),
        collections: JSON.parse(JSON.stringify(collections)),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch metadata' };
  }
}

export async function createProductAction(input: any) {
  try {
    const user = await requireAdminAccess();
    const product = await MerchantProductService.createMerchantProduct({
      ...input,
      sellerId: input.sellerId || user.id,
    });
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

export async function updateProductAction(id: string, input: any) {
  try {
    await requireAdminAccess();
    await MerchantProductService.updateMerchantProduct(id, input);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAdminAccess();
    await MerchantProductService.deleteMerchantProduct(id);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete product' };
  }
}

export async function bulkUpdateStatusAction(ids: string[], status: 'ACTIVE' | 'ARCHIVED') {
  try {
    await requireAdminAccess();
    await MerchantProductService.bulkUpdateStatus(ids, status);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk update status' };
  }
}

export async function bulkDeleteAction(ids: string[]) {
  try {
    await requireAdminAccess();
    await MerchantProductService.bulkDelete(ids);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk delete products' };
  }
}

