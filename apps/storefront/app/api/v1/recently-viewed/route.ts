import { NextRequest } from 'next/server';
import { historyService } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { getAuthUser } from '@corecart/commerce';
import { AppError } from '@corecart/shared';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const items = await historyService.getRecentlyViewed(user.id);
  return successResponse(items);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  if (!body.productId) throw new AppError('productId required', 400);

  await historyService.addRecentlyViewed(user.id, body.productId);
  return successResponse(null, 'Added to recently viewed');
}
