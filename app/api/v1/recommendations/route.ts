import { NextRequest } from 'next/server';
import { recommendationService } from '../../../../lib/modules/shopping/recommendation.service';
import { successResponse } from '../../../../lib/utils/response';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const type = searchParams.get('type') as 'trending' | 'best_sellers' | 'new_arrivals' | 'similar' | undefined;
  
  const products = await recommendationService.getRecommendations({
    type,
    productId: searchParams.get('productId') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    brandId: searchParams.get('brandId') || undefined,
    limit: Number(searchParams.get('limit')) || 10,
  });

  return successResponse(products);
}
