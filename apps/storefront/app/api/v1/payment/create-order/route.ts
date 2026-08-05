export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { paymentService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "sessionId is required" }, { status: 400 });
    }

    const result = await paymentService.initializeOrderPayment(sessionId);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Failed to initialize order payment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

