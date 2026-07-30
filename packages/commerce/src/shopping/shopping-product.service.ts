import { prisma } from '@corecart/database';
import { cache } from '@corecart/shared';
import { AppError } from '@corecart/shared';
import { mapProductToUI } from './product.mapper';

export class ShoppingProductService {
  async listProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string; // slug
    brand?: string; // slug
    collection?: string; // slug
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    tags?: string;
    sort?: string;
    currency?: string; // from manifest.settings.defaultCurrency
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const baseWhere: any = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      deletedAt: null,
    };

    if (params.category) {
      baseWhere.category = { slug: params.category };
    }
    if (params.brand) {
      baseWhere.brand = { slug: params.brand };
    }
    if (params.collection) {
      baseWhere.collections = { some: { collection: { slug: params.collection } } };
    }
    if (params.rating) {
      baseWhere.ratingAverage = { gte: params.rating };
    }
    if (params.minPrice || params.maxPrice) {
      baseWhere.variants = {
        some: {
          price: {
            ...(params.minPrice ? { gte: params.minPrice } : {}),
            ...(params.maxPrice ? { lte: params.maxPrice } : {}),
          }
        }
      };
    }

    // Determine orderBy
    let orderBy: any = { createdAt: 'desc' };
    switch (params.sort) {
      case 'rating_desc':
        orderBy = { ratingAverage: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'sales_desc':
        orderBy = { salesCount: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
    }

    const include = {
      brand: true,
      category: true,
      variants: {
        include: { inventory: true, pricing: true },
      },
      images: {
        include: { media: true },
      },
      tags: { include: { tag: true } },
      specifications: true,
    };

    let hasDirectMatches = true;
    let recommendations: any[] = [];
    let items: any[] = [];
    let total = 0;

    // LEVEL 1: Direct product matches
    const where = { ...baseWhere };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { shortDescription: { contains: params.search } }
      ];
    }

    [total, items] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include
      }),
    ]);

    // PROGRESSIVE FALLBACKS (only if this is a search query and Level 1 yielded zero results)
    if (params.search && items.length === 0) {
      hasDirectMatches = false;

      // LEVEL 2: Category / Brand matches
      const level2Where = {
        ...baseWhere,
        OR: [
          { category: { name: { contains: params.search } } },
          { brand: { name: { contains: params.search } } }
        ]
      };
      
      let fallbackProducts = await prisma.product.findMany({
        where: level2Where,
        take: limit,
        orderBy,
        include
      });

      // LEVEL 3: Token / Tags / Attribute matches
      if (fallbackProducts.length === 0) {
        const tokens = params.search.split(/\s+/).filter(t => t.trim().length > 2);
        
        if (tokens.length > 0) {
          // Try AND first (must match all tokens somewhere)
          const andConditions = tokens.map(t => ({
            OR: [
              { name: { contains: t } },
              { shortDescription: { contains: t } },
              { tags: { some: { tag: { name: { contains: t } } } } },
              { specifications: { some: { value: { contains: t } } } }
            ]
          }));
          
          fallbackProducts = await prisma.product.findMany({
            where: { ...baseWhere, AND: andConditions },
            take: limit,
            orderBy,
            include
          });

          // If AND returns 0, fallback to OR (match any token)
          if (fallbackProducts.length === 0) {
            const orConditions = tokens.flatMap(t => [
              { name: { contains: t } },
              { shortDescription: { contains: t } },
              { tags: { some: { tag: { name: { contains: t } } } } },
              { specifications: { some: { value: { contains: t } } } }
            ]);
            fallbackProducts = await prisma.product.findMany({
              where: { ...baseWhere, OR: orConditions },
              take: limit,
              orderBy,
              include
            });
          }
        }
      }

      // LEVEL 4: Discovery fallback
      if (fallbackProducts.length === 0) {
        fallbackProducts = await prisma.product.findMany({
          where: baseWhere,
          take: limit,
          orderBy: { createdAt: 'desc' }, // deterministic fallback
          include
        });
      }

      recommendations = fallbackProducts;
    }

    // Format for UI — currency always comes from manifest via caller
    const currency = params.currency || 'INR';
    const mappedItems = items.map((p) => mapProductToUI(p, currency));
    const mappedRecommendations = recommendations.map((p) => mapProductToUI(p, currency));

    return {
      items: hasDirectMatches ? mappedItems : [],
      recommendations: hasDirectMatches ? [] : mappedRecommendations,
      hasDirectMatches,
      meta: {
        total: hasDirectMatches ? total : 0,
        page,
        limit,
        totalPages: hasDirectMatches ? Math.ceil(total / limit) : 0,
      }
    };
  }

  async getProductBySlug(slug: string, currency: string = 'INR') {
    const cacheKey = `product:${slug}`;
    const cached = process.env.NODE_ENV === 'production' ? await cache.get<any>(cacheKey) : null;
    if (cached) return cached;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: {
          include: { inventory: true, pricing: true },
        },
        images: {
          include: { media: true },
        },
        tags: { include: { tag: true } },
        specifications: true,
        reviews: {
          include: { user: { include: { avatar: true } } },
          take: 5,
          orderBy: { helpfulVotes: 'desc' }
        }
      }
    });

    if (!product || product.status !== 'ACTIVE' || product.deletedAt) {
      throw new AppError('Product not found', 404);
    }

    const mapped = mapProductToUI(product, currency);
    await cache.set(cacheKey, mapped, 300); // cache for 5 mins
    return mapped;
  }
}

export const shoppingProductService = new ShoppingProductService();
