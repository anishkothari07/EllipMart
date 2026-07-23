import { NextRequest } from 'next/server';
import { historyService } from '../../../../lib/modules/shopping/history.service';
import { successResponse } from '../../../../lib/utils/response';
import { getAuthUser } from '../../../../lib/modules/auth/auth.service';
import { AppError } from '../../../../lib/utils/errorHandler';

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
