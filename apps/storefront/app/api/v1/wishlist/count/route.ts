import { NextRequest } from 'next/server';
import { wishlistService } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { getAuthUser } from '@corecart/commerce';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return successResponse({ count: 0 });

  const count = await wishlistService.getWishlistCount(user.id);
  return successResponse({ count });
}
