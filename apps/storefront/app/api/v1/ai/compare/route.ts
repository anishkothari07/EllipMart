export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';
import { AIService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { productId1, productId2 } = await req.json();
    if (!productId1 || !productId2) {
      return NextResponse.json({ success: false, error: "Both productIds are required" }, { status: 400 });
    }

    const [p1, p2] = await Promise.all([
      db.product.findUnique({ where: { id: productId1 }, include: { specifications: { include: { spec: true } } } }),
      db.product.findUnique({ where: { id: productId2 }, include: { specifications: { include: { spec: true } } } }),
    ]);

    if (!p1 || !p2) {
      return NextResponse.json({ success: false, error: "One or both products not found" }, { status: 404 });
    }

    const context = `
Product 1: ${p1.name} (Specs: ${p1.longDescription || "N/A"}, Specs relation: ${p1.specifications.map(s => `${s.spec.name}: ${s.value}`).join(", ")})
Product 2: ${p2.name} (Specs: ${p2.longDescription || "N/A"}, Specs relation: ${p2.specifications.map(s => `${s.spec.name}: ${s.value}`).join(", ")})
`;

    const schema = {
      type: "object",
      properties: {
        winner: { type: "string" },
        features: {
          type: "array",
          items: {
            type: "object",
            properties: {
              feature: { type: "string" },
              val1: { type: "string" },
              val2: { type: "string" },
            },
            required: ["feature", "val1", "val2"]
          }
        }
      },
      required: ["winner", "features"]
    };

    const structuredData = await AIService.generateStructuredOutput(
      "PRODUCT_COMPARE",
      `Compare Product 1 (${p1.name}) and Product 2 (${p2.name}). Match exact features like Price, Camera, Battery, Display, Processor, Gaming, Photography, Winner.`,
      schema,
      context
    );

    return NextResponse.json({
      success: true,
      product1: { id: p1.id, name: p1.name },
      product2: { id: p2.id, name: p2.name },
      comparison: structuredData
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

