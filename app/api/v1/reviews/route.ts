import { NextRequest } from 'next/server';
import { reviewService } from '../../../../lib/modules/shopping/review.service';
import { createReviewSchema } from '../../../../lib/modules/shopping/review.dto';
import { successResponse } from '../../../../lib/utils/response';
import { getAuthUser } from '../../../../lib/modules/auth/auth.service';
import { AppError } from '../../../../lib/utils/errorHandler';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  if (!productId) throw new AppError('productId is required', 400);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const result = await reviewService.getReviews(productId, page, limit);
  return successResponse(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const parsed = createReviewSchema.parse(body);

  const review = await reviewService.createReview(user.id, parsed);
  return successResponse(review, 'Review created successfully', 201);
}
