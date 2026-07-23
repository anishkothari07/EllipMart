import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/modules/ai/ai.service";

export async function POST(req: NextRequest) {
  try {
    const { productName } = await req.json();
    if (!productName) {
      return NextResponse.json({ success: false, error: "productName is required" }, { status: 400 });
    }
    const description = await AIService.generateText("CATALOG_DESC", `productName: ${productName}`);
    return NextResponse.json({ success: true, description });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
