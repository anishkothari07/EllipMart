import { NextRequest } from 'next/server';
import { shoppingProductService } from '../../../../../lib/modules/shopping/shopping-product.service';
import { successResponse } from '../../../../../lib/utils/response';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await shoppingProductService.getProductBySlug(params.slug);
  return successResponse(product, 'Product retrieved successfully');
}
