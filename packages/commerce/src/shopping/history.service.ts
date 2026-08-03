import { prisma } from '@corecart/database';
import { cache } from '@corecart/shared';

export class HistoryService {
  async getRecentlyViewed(userId: string) {
    const history = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 20,
    });

    if (!history.length) return [];

    const productIds = history.map(h => h.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: { take: 1, include: { inventory: true } },
        images: { take: 1 },
      }
    });

    // Restore the sorted order from history
    return history.map(h => products.find(p => p.id === h.productId)).filter(Boolean);
  }

  async addRecentlyViewed(userId: string, productId: string) {
    const now = new Date();

    // Upsert the recently viewed record
    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        }
      },
      update: { viewedAt: now },
      create: {
        userId,
        productId,
        viewedAt: now,
      }
    });

    // Cleanup: keep only latest 20
    const allItems = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      select: { id: true }
    });

    if (allItems.length > 20) {
      const toDelete = allItems.slice(20).map(item => item.id);
      await prisma.recentlyViewed.deleteMany({
        where: { id: { in: toDelete } }
      });
    }

    // Handle viewCount increment with 30-min cooldown
    const sessionCacheKey = `view:${userId}:${productId}`;
    const hasViewedRecently = await cache.get(sessionCacheKey);

    if (!hasViewedRecently) {
      // Set cooldown cache for 30 minutes (1800 seconds)
      await cache.set(sessionCacheKey, true, 1800);

      // Increment product viewCount safely
      await prisma.product.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      });
    }
  }

  async clearRecentlyViewed(userId: string) {
    await prisma.recentlyViewed.deleteMany({ where: { userId } });
  }

  // ==== SEARCH HISTORY ====

  async logSearch(userId: string | null, query: string, resultCount: number = 0, clickedProductId?: string) {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    // Log the search
    await prisma.searchHistory.create({
      data: {
        userId,
        query: cleanQuery,
        resultCount,
        clickedProductId,
      }
    });

    // Update Popular Searches
    await prisma.popularSearch.upsert({
      where: { query: cleanQuery },
      update: { searchCount: { increment: 1 } },
      create: { query: cleanQuery, searchCount: 1 }
    });
  }

  async getSearchHistory(userId: string) {
    // Only return distinct recent queries
    const history = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      distinct: ['query'],
      take: 10,
      select: { query: true, createdAt: true }
    });
    return history;
  }

  async getPopularSearches() {
    return prisma.popularSearch.findMany({
      orderBy: { searchCount: 'desc' },
      take: 10,
    });
  }

  async clearSearchHistory(userId: string) {
    await prisma.searchHistory.deleteMany({ where: { userId } });
  }
}

export const historyService = new HistoryService();
