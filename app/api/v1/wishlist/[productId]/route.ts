import { NextRequest } from 'next/server';
import { wishlistService } from '../../../../../lib/modules/shopping/wishlist.service';
import { successResponse } from '../../../../../lib/utils/response';
import { getAuthUser } from '../../../../../lib/modules/auth/auth.service';
import { AppError } from '../../../../../lib/utils/errorHandler';

export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  await wishlistService.remove(user.id, params.productId);
  return successResponse(null, 'Removed from wishlist');
}

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  // Move to cart action
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action !== 'cart') {
    throw new AppError('Invalid action', 400);
  }

  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  let variantId;
  try {
    const body = await req.json();
    variantId = body.variantId;
  } catch (e) {
    // Ignore JSON error
  }

  await wishlistService.moveToCart(user.id, params.productId, variantId);
  return successResponse(null, 'Moved to cart');
}
