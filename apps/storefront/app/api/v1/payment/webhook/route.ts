import { NextRequest, NextResponse } from "next/server";
import { paymentService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const rawPayload = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    
    // Determine provider from url, headers or payload. For now we assume RAZORPAY
    const providerId = "RAZORPAY";

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }

    const result = await paymentService.handleWebhook(providerId, rawPayload, signature);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Webhook processing failed:", error);
    // Usually webhooks expect a 200 OK even on error to stop retrying unless it's a transient failure,
    // but Razorpay handles 400 as a fail and will retry. Let's return 400 for bad signatures.
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
