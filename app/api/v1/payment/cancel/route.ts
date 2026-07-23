import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/modules/payment/payment.service";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      return NextResponse.json({ success: false, error: "paymentId is required" }, { status: 400 });
    }

    const result = await paymentService.cancelPayment(paymentId);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Failed to cancel payment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
