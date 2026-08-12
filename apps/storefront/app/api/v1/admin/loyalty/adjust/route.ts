export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { loyaltyService, getAuthUser } from '@corecart/commerce';
import { AppError, successResponse, errorResponse } from '@corecart/shared';

/**
 * POST /api/v1/admin/loyalty/adjust
 * Body: { userId: string, points: number, reason: string }
 * Admin route to grant (+points) or deduct (-points) loyalty points manually.
 */
export async function POST(req: NextRequest) {
  try {
    const adminUser = await getAuthUser(req);
    if (!adminUser) throw new AppError('Unauthorized', 401);
    
    // Check Admin Role
    if (adminUser.role !== 'ADMIN') {
      throw new AppError('Forbidden: Admin access required', 403);
    }

    const body = await req.json();
    const { userId, points, reason } = body;

    if (!userId || typeof points !== 'number' || !reason?.trim()) {
      throw new AppError('Invalid payload: userId, numeric points, and reason are required', 400);
    }

    const transaction = await loyaltyService.adminAdjust(
      userId,
      points,
      reason.trim(),
      adminUser.id
    );

    return successResponse(transaction, 'Loyalty points adjusted successfully');
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
