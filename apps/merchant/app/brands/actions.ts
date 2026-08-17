'use server';

import { brandService } from '@corecart/commerce/src/catalog/brand.service';
import { requireMerchantAccess } from '@corecart/shared/src/auth';
import { revalidatePath } from 'next/cache';
import { prisma } from '@corecart/database';

export async function fetchBrandsAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  try {
    await requireMerchantAccess();
    const data = await brandService.listBrands({
      page: params.page || 1,
      limit: params.limit || 20,
      search: params.search,
      isActive: params.isActive,
    });
    
    // We need to fetch product counts manually for the dashboard if not returned by brandService
    const brandsWithCounts = await Promise.all(data.items.map(async (brand: any) => {
      const productCount = await prisma.product.count({
        where: { brandId: brand.id, deletedAt: null }
      });
      return { ...brand, _count: { products: productCount } };
    }));
    
    return { 
      success: true, 
      data: {
        ...data,
        items: JSON.parse(JSON.stringify(brandsWithCounts))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch brands' };
  }
}

export async function fetchBrandByIdAction(id: string) {
  try {
    await requireMerchantAccess();
    const data = await brandService.getBrandById(id);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch brand' };
  }
}

export async function createBrandAction(input: any) {
  try {
    await requireMerchantAccess();
    const brand = await brandService.createBrand({
      name: input.name,
      slug: input.slug,
      mediaId: input.mediaId || undefined,
      description: input.description,
      isActive: input.isActive ?? true,
    });
    revalidatePath('/brands');
    return { success: true, data: JSON.parse(JSON.stringify(brand)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create brand' };
  }
}

export async function updateBrandAction(id: string, input: any) {
  try {
    await requireMerchantAccess();
    await brandService.updateBrand(id, {
      name: input.name,
      slug: input.slug,
      mediaId: input.mediaId || undefined,
      description: input.description,
      isActive: input.isActive,
    });
    revalidatePath('/brands');
    revalidatePath(`/brands/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update brand' };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    await requireMerchantAccess();
    await brandService.deleteBrand(id);
    revalidatePath('/brands');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete brand' };
  }
}

export async function bulkDeleteBrandAction(ids: string[]) {
  try {
    await requireMerchantAccess();
    for (const id of ids) {
       await brandService.deleteBrand(id);
    }
    revalidatePath('/brands');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete brands' };
  }
}
