export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { collectionService } from '@corecart/commerce';
import { createCollectionSchema, collectionSearchSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function POST(req: NextRequest) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = createCollectionSchema.parse(body);
  
  const collection = await collectionService.createCollection(parsed);
  return successResponse(collection, 'Collection created successfully', 201);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const query = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || undefined,
    isActive: searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined,
  };

  const parsed = collectionSearchSchema.parse(query);
  const result = await collectionService.listCollections(parsed);
  
  return successResponse(result, 'Collections retrieved successfully');
}

