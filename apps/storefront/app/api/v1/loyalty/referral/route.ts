export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { loyaltyService, getAuthUser } from '@corecart/commerce';
import { AppError, successResponse, errorResponse } from '@corecart/shared';

/** GET /api/v1/loyalty/referral — referral code, statistics, & friends list */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) throw new AppError('Unauthorized', 401);

    const stats = await loyaltyService.getReferralStats(user.id);
    return successResponse(stats);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
