export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { reviewService } from '@corecart/commerce';
import { updateReviewSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { getAuthUser } from '@corecart/commerce';
import { AppError } from '@corecart/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const { id: reviewId } = await params;
  const body = await req.json();
  const parsed = updateReviewSchema.parse(body);

  const review = await reviewService.updateReview(user.id, reviewId, parsed);
  return successResponse(review, 'Review updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) throw new AppError('Unauthorized', 401);

  const { id: reviewId } = await params;
  await reviewService.deleteReview(user.id, reviewId);
  return successResponse(null, 'Review deleted successfully');
}
