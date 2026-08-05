export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { collectionService } from '@corecart/commerce';
import { updateCollectionSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await collectionService.getCollectionById(id);
  return successResponse(collection, 'Collection retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateCollectionSchema.parse(body);
  
  const { id } = await params;
  const collection = await collectionService.updateCollection(id, parsed);
  return successResponse(collection, 'Collection updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const { id } = await params;
  await collectionService.deleteCollection(id);
  return successResponse(null, 'Collection deleted successfully');
}
