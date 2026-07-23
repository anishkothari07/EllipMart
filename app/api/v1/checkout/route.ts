import { NextRequest } from 'next/server';
import { checkoutService } from '@/lib/modules/checkout/checkout.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const body = await req.json();
    
    // Process Checkout
    // Expected body: addressId, couponCode, shippingRateId, paymentProvider
    const result = await checkoutService.processCheckout(userId, body);
    
    return successResponse(result);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
