import { NextRequest } from 'next/server';
import { historyService } from '../../../../lib/modules/shopping/history.service';
import { shoppingProductService } from '../../../../lib/modules/shopping/shopping-product.service';
import { successResponse } from '../../../../lib/utils/response';
import { getAuthUser } from '../../../../lib/modules/auth/auth.service';

import { preProcessSearchQuery } from '../../../../lib/localization/search-synonym';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawQuery = searchParams.get('q') || '';
  const query = preProcessSearchQuery(rawQuery);
  const isInstant = searchParams.get('instant') === 'true';

  const user = await getAuthUser(req);
  const userId = user ? user.id : null;

  if (!query) {
    // If no query, return popular searches and recent searches if logged in
    const popular = await historyService.getPopularSearches();
    const recent = userId ? await historyService.getSearchHistory(userId) : [];
    
    return successResponse({
      suggestions: [],
      products: [],
      popular: popular.map(p => p.query),
      recent: recent.map(r => r.query),
    });
  }

  // Perform product search
  // Instant search only needs top 5 results, regular search needs full pagination
  const limit = isInstant ? 5 : Number(searchParams.get('limit')) || 20;
  
  const result = await shoppingProductService.listProducts({
    search: query,
    limit,
    page: Number(searchParams.get('page')) || 1,
  });

  // Log the search asynchronously
  if (!isInstant) {
    historyService.logSearch(userId, query, result.meta.total).catch(console.error);
  } else {
    // For instant search, we might log suggestions without click tracking, or not log to prevent spam
  }

  return successResponse({
    suggestions: result.items.slice(0, 5).map(p => p.name), // Mock suggestions from product names
    products: result.items,
    meta: result.meta,
  });
}
