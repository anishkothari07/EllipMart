import { NextRequest } from 'next/server';
import { couponService } from '@/lib/modules/coupon/coupon.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const body = await req.json();
    const { code, subtotal } = body;
    
    if (!code) throw new AppError('Coupon code is required', 400);

    const couponResult = await couponService.validateAndApply(code, Number(subtotal) || 0, userId || 'guest');
    
    return successResponse(couponResult);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
