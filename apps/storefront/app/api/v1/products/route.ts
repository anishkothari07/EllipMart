export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { shoppingProductService } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const result = await shoppingProductService.listProducts({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    search: searchParams.get('search') || searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    collection: searchParams.get('collection') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    tags: searchParams.get('tags') || undefined,
    sort: searchParams.get('sort') || undefined,
  });
  
  return successResponse(result, 'Products retrieved successfully');
}

