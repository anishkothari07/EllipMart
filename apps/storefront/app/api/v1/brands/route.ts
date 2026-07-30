import { NextRequest } from 'next/server';
import { brandService } from '@corecart/commerce';
import { createBrandSchema, brandSearchSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function POST(req: NextRequest) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = createBrandSchema.parse(body);
  
  const brand = await brandService.createBrand(parsed);
  return successResponse(brand, 'Brand created successfully', 201);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const query = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    search: searchParams.get('search') || undefined,
    isActive: searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined,
  };

  const parsed = brandSearchSchema.parse(query);
  const result = await brandService.listBrands(parsed);
  
  return successResponse(result, 'Brands retrieved successfully');
}
