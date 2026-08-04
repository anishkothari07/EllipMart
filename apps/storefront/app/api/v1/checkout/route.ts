import { NextRequest } from 'next/server';
import { checkoutService } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

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
    console.error('[CHECKOUT 500 TRACE]', error.stack);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
