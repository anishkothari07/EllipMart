'use server';

import { marketingMerchantService, MarketingContent } from '@corecart/commerce/src/marketing/marketing-merchant.service';
import { prisma } from '@corecart/database';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────
// GET / SAVE CONTENT
// ─────────────────────────────────────────────

export async function fetchMarketingContentAction() {
  try {
    const data = await marketingMerchantService.getMarketingContent();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch marketing content.' };
  }
}

export async function updateMarketingContentAction(content: MarketingContent) {
  try {
    const data = await marketingMerchantService.saveMarketingContent(content);
    revalidatePath('/marketing');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save marketing content.' };
  }
}

// ─────────────────────────────────────────────
// FETCH COLLECTIONS / PRODUCTS FOR PICKERS
// ─────────────────────────────────────────────

export async function fetchCollectionsAndProductsAction() {
  try {
    const [collections, products] = await Promise.all([
      prisma.collection.findMany({
        select: { id: true, name: true, slug: true, description: true },
      }),
      prisma.product.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true, status: true },
      }),
    ]);

    return {
      success: true,
      data: {
        collections: JSON.parse(JSON.stringify(collections)),
        products: JSON.parse(JSON.stringify(products)),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load collections or products.' };
  }
}
