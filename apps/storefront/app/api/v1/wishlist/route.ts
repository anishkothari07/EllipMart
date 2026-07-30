import { NextRequest } from 'next/server';
import { wishlistService } from '@corecart/commerce';
import { addToWishlistSchema, bulkDeleteWishlistSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { getAuthUser } from '@corecart/commerce';
import { AppError } from '@corecart/shared';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const items = await wishlistService.getWishlist(user.id);
  return successResponse(items);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const parsed = addToWishlistSchema.parse(body);

  const item = await wishlistService.add(user.id, parsed);
  return successResponse(item, 'Added to wishlist', 201);
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  // Check if bulk or clear
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action === 'clear') {
    await wishlistService.clear(user.id);
    return successResponse(null, 'Wishlist cleared');
  }

  // Else try bulk parse
  const body = await req.json();
  const parsed = bulkDeleteWishlistSchema.parse(body);
  await wishlistService.bulkDelete(user.id, parsed.productIds);

  return successResponse(null, 'Items removed from wishlist');
}
