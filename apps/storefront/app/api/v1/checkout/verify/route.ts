export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId, paymentId } = body;

    if (!orderId || !paymentId || !razorpay_payment_id) {
      return NextResponse.json(errorResponse('Missing required verification fields', 'INVALID_INPUT'), { status: 400 });
    }

    const result = await paymentService.verifyPayment(
      orderId,
      paymentId,
      razorpay_payment_id,
      razorpay_signature
    );

    if (result.confirmed) {
      return NextResponse.json(successResponse(result));
    } else {
      return NextResponse.json(errorResponse('Payment verification failed', 'PAYMENT_FAILED'), { status: 400 });
    }
  } catch (error: any) {
    console.error('[CHECKOUT VERIFY ERROR]', error);
    return NextResponse.json(errorResponse(error.message || 'Verification Failed', 'VERIFICATION_ERROR'), { status: 500 });
  }
}
