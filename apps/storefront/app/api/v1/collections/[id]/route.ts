import { NextRequest } from 'next/server';
import { collectionService } from '@corecart/commerce';
import { updateCollectionSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const collection = await collectionService.getCollectionById(params.id);
  return successResponse(collection, 'Collection retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateCollectionSchema.parse(body);
  
  const collection = await collectionService.updateCollection(params.id, parsed);
  return successResponse(collection, 'Collection updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  await collectionService.deleteCollection(params.id);
  return successResponse(null, 'Collection deleted successfully');
}
