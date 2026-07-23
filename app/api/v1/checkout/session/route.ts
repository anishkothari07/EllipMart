import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/modules/payment/payment.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // In a real app we would validate the body using Zod
    const session = await paymentService.createCheckoutSession(body);
    
    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
