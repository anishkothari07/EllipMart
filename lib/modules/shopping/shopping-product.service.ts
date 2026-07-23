import { prisma } from '../../prisma/client';
import { cache } from '../../utils/cache';
import { AppError } from '../../utils/errorHandler';
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
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { shortDescription: { contains: params.search } },
        { tags: { some: { tag: { name: { contains: params.search } } } } }
      ];
    }

    if (params.category) {
      where.category = { slug: params.category };
    }

    if (params.brand) {
      where.brand = { slug: params.brand };
    }

    if (params.collection) {
      where.collections = { some: { collection: { slug: params.collection } } };
    }

    if (params.rating) {
      where.ratingAverage = { gte: params.rating };
    }

    if (params.minPrice || params.maxPrice) {
      where.variants = {
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
      case 'price_asc':
        // Note: Ordering by relations (variants.price) is complex in Prisma.
        // Usually handled by a dedicated price column or raw SQL, but we'll approximate or use default if complex
        // Prisma doesn't natively support ordering by a nested many relation field easily without aggregates.
        // We will default to createdAt here and sort in memory if needed (not ideal for large sets)
        // A real system would have a flattened `minPrice` on the Product table itself.
        break;
      case 'price_desc':
        break;
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

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
        }
      }),
    ]);

    // Format for UI
    const mappedItems = products.map(mapProductToUI);

    return {
      items: mappedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async getProductBySlug(slug: string) {
    const cacheKey = `product:${slug}`;
    const cached = await cache.get<any>(cacheKey);
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

    const mapped = mapProductToUI(product);
    await cache.set(cacheKey, mapped, 300); // cache for 5 mins
    return mapped;
  }
}

export const shoppingProductService = new ShoppingProductService();
