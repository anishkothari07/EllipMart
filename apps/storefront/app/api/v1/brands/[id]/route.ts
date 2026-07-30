import { NextRequest } from 'next/server';
import { brandService } from '@corecart/commerce';
import { updateBrandSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const brand = await brandService.getBrandById(params.id);
  return successResponse(brand, 'Brand retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateBrandSchema.parse(body);
  
  const brand = await brandService.updateBrand(params.id, parsed);
  return successResponse(brand, 'Brand updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  await brandService.deleteBrand(params.id);
  return successResponse(null, 'Brand deleted successfully');
}
