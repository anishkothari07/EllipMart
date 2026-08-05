export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { orderService } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const { id: orderId } = await params;
    const result = await orderService.cancelOrder(orderId, userId);

    return successResponse(result);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
