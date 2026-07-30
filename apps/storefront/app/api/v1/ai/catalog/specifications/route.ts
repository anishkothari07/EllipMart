import { NextRequest, NextResponse } from "next/server";
import { AIService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { productName } = await req.json();
    if (!productName) {
      return NextResponse.json({ success: false, error: "productName is required" }, { status: 400 });
    }
    const specs = await AIService.generateStructuredOutput("CATALOG_DESC", `Extract specifications for: ${productName}`, {
      type: "object",
      properties: {
        bullets: { type: "array", items: { type: "string" } }
      }
    });
    return NextResponse.json({ success: true, ...specs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
