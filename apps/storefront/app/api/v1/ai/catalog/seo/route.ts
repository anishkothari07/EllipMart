import { NextRequest, NextResponse } from "next/server";
import { AIService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();
    if (!title || !description) {
      return NextResponse.json({ success: false, error: "title and description are required" }, { status: 400 });
    }
    const score = await AIService.generateStructuredOutput("SEO_SCORE", `Title: ${title}\nDescription: ${description}`, {
      type: "object",
      properties: {
        score: { type: "number" },
        suggestions: { type: "array", items: { type: "string" } }
      }
    });
    return NextResponse.json({ success: true, ...score });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
