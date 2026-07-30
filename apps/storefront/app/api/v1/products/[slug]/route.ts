import { NextRequest } from 'next/server';
import { shoppingProductService } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await shoppingProductService.getProductBySlug(slug);
  return successResponse(product, 'Product retrieved successfully');
}
