import { NextRequest } from 'next/server';
import { reviewService } from '../../../../../lib/modules/shopping/review.service';
import { updateReviewSchema } from '../../../../../lib/modules/shopping/review.dto';
import { successResponse } from '../../../../../lib/utils/response';
import { getAuthUser } from '../../../../../lib/modules/auth/auth.service';
import { AppError } from '../../../../../lib/utils/errorHandler';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const parsed = updateReviewSchema.parse(body);

  const review = await reviewService.updateReview(user.id, params.id, parsed);
  return successResponse(review, 'Review updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  await reviewService.deleteReview(user.id, params.id);
  return successResponse(null, 'Review deleted successfully');
}
