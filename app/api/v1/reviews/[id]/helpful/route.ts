import { NextRequest } from 'next/server';
import { reviewService } from '../../../../../../lib/modules/shopping/review.service';
import { successResponse } from '../../../../../../lib/utils/response';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Can be called by guests or users
  await reviewService.markHelpful(params.id);
  return successResponse(null, 'Review marked as helpful');
}
