import { NextRequest } from 'next/server';
import { wishlistService } from '../../../../../lib/modules/shopping/wishlist.service';
import { successResponse } from '../../../../../lib/utils/response';
import { getAuthUser } from '../../../../../lib/modules/auth/auth.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return successResponse({ count: 0 });

  const count = await wishlistService.getWishlistCount(user.id);
  return successResponse({ count });
}
