export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { WebhookProvider } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { targetUrl, secret, event, payload } = await req.json();

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: "targetUrl is required" }, { status: 400 });
    }

    const provider = new WebhookProvider();
    const result = await provider.send({
      recipient: targetUrl,
      secret: secret || "whsec_test_secret",
      body: JSON.stringify({ event: event || "OrderCreated", payload: payload || { test: true } }),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

