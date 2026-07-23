import { NextRequest } from 'next/server';
import { orderService } from '@/lib/modules/order/order.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/utils/errorHandler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const orderId = params.id;
    const order = await orderService.getOrderById(orderId, userId);
    
    return successResponse(order);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
