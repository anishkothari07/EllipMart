import { NextRequest, NextResponse } from "next/server";
import { refundService } from "@/lib/modules/payment/refund.service";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, amount, reason } = await req.json();
    
    if (!paymentId || !amount) {
      return NextResponse.json({ success: false, error: "paymentId and amount are required" }, { status: 400 });
    }

    const result = await refundService.processRefund(paymentId, amount, reason);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Failed to refund payment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
