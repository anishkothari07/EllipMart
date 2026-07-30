import { NextRequest } from 'next/server';
import { orderService } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const orders = await orderService.getOrdersByUser(userId);
    return successResponse(orders);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}

// NOTE: Creating an order manually via API is usually reserved for Admin or Checkout flow
// We don't expose POST /orders to users directly unless required by specific design
