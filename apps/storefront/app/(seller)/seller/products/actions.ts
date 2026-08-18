'use server';

import { MerchantProductService } from '@corecart/commerce/src/catalog/merchant-product.service';
import { requireSellerAccess } from '@corecart/shared/src/auth';
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
    const user = await requireSellerAccess();
    const data = await MerchantProductService.listMerchantProducts({ ...params, sellerId: user.id });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch products' };
  }
}

export async function fetchProductByIdAction(id: string) {
  try {
    const user = await requireSellerAccess();
    const data = await MerchantProductService.getMerchantProduct(id, user.id);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch product' };
  }
}

export async function fetchBrandsAndCategoriesAction() {
  try {
    await requireSellerAccess();
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
    const user = await requireSellerAccess();
    const product = await MerchantProductService.createMerchantProduct({ ...input, sellerId: user.id });
    revalidatePath('/seller/products');
    revalidatePath('/');
    revalidatePath('/search');
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

export async function updateProductAction(id: string, input: any) {
  try {
    const user = await requireSellerAccess();
    await MerchantProductService.updateMerchantProduct(id, input, user.id);
    revalidatePath('/seller/products');
    revalidatePath(`/seller/products/${id}`);
    revalidatePath('/');
    revalidatePath('/search');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const user = await requireSellerAccess();
    await MerchantProductService.deleteMerchantProduct(id, user.id);
    revalidatePath('/seller/products');
    revalidatePath('/');
    revalidatePath('/search');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete product' };
  }
}

export async function bulkUpdateStatusAction(ids: string[], status: 'ACTIVE' | 'ARCHIVED') {
  try {
    const user = await requireSellerAccess();
    await MerchantProductService.bulkUpdateStatus(ids, status, user.id);
    revalidatePath('/seller/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk update status' };
  }
}

export async function bulkDeleteAction(ids: string[]) {
  try {
    const user = await requireSellerAccess();
    await MerchantProductService.bulkDelete(ids, user.id);
    revalidatePath('/seller/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk delete products' };
  }
}
