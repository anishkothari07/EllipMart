import { NextRequest } from 'next/server';
import { reviewService } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Can be called by guests or users
  const { id: reviewId } = await params;
  await reviewService.markHelpful(reviewId);
  return successResponse(null, 'Review marked as helpful');
}
