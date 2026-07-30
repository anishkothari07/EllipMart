import { prisma } from '@corecart/database';
import { mapProductToUI } from './product.mapper';

export class RecommendationService {
  async getRecommendations(params: {
    productId?: string;
    categoryId?: string;
    brandId?: string;
    type?: 'trending' | 'best_sellers' | 'new_arrivals' | 'similar';
    limit?: number;
    currency?: string;
  }) {
    const limit = params.limit || 10;
    let where: any = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      deletedAt: null,
    };

    let orderBy: any = { createdAt: 'desc' };

    if (params.type === 'trending') {
      orderBy = { viewCount: 'desc' };
    } else if (params.type === 'best_sellers') {
      orderBy = { salesCount: 'desc' };
    } else if (params.type === 'new_arrivals') {
      orderBy = { createdAt: 'desc' };
    } else if (params.type === 'similar') {
      // Basic similar items logic (Same category or brand)
      if (params.categoryId) {
        where.categoryId = params.categoryId;
      }
      if (params.brandId) {
        where.brandId = params.brandId;
      }
      if (params.productId) {
        where.id = { not: params.productId }; // Exclude current product
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        brand: true,
        category: true,
        variants: { include: { inventory: true, pricing: true } }, // Include pricing for price mapping!
        images: { include: { media: true } }, // Include media for image mapping!
        tags: { include: { tag: true } },
      }
    });

    const currency = params.currency || 'INR';
    return products.map((p) => mapProductToUI(p, currency));
  }
}

export const recommendationService = new RecommendationService();

