import { NextRequest, NextResponse } from "next/server";
import { paymentService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentId, providerPaymentId, signature } = body;
    
    if (!orderId || !paymentId || !providerPaymentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const result = await paymentService.verifyPayment(
      orderId, 
      paymentId, 
      providerPaymentId, 
      signature
    );
    
    if (result.isVerified) {
      return NextResponse.json({ success: true, data: result });
    } else {
      return NextResponse.json({ success: false, error: "Payment verification failed", data: result }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Failed to verify payment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
