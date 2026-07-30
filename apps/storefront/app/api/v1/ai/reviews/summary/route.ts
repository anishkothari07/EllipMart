import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';
import { AIService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { reviews: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const reviews = product.reviews || [];
    if (reviews.length === 0) {
      return NextResponse.json({ success: true, summary: "No reviews available yet for this product." });
    }

    const context = `Product: ${product.name}\nReviews:\n${reviews.map((r, i) => `${i+1}. Rating: ${r.rating}, Comment: ${r.comment || "N/A"}`).join("\n")}`;

    const summary = await AIService.generateText("REVIEW_SUMMARY", "Summarize reviews.", context);

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
