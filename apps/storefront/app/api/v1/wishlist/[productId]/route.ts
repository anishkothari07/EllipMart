export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { wishlistService } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { getAuthUser } from '@corecart/commerce';
import { AppError } from '@corecart/shared';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const { productId } = await params;
  await wishlistService.remove(user.id, productId);
  return successResponse(null, 'Removed from wishlist');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  // Move to cart action
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action !== 'cart') {
    throw new AppError('Invalid action', 400);
  }

  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const { productId } = await params;
  let variantId;
  try {
    const body = await req.json();
    variantId = body.variantId;
  } catch (e) {
    // Ignore JSON error
  }

  await wishlistService.moveToCart(user.id, productId, variantId);
  return successResponse(null, 'Moved to cart');
}
