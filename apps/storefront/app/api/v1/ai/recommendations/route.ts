import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let products: any[] = [];
    if (productId) {
      const activeProd = await db.product.findUnique({ where: { id: productId } });
      if (activeProd) {
        products = await db.product.findMany({
          where: {
            categoryId: activeProd.categoryId,
            id: { not: productId },
          },
          take: 4,
        });
      }
    }

    if (products.length === 0) {
      products = await db.product.findMany({
        take: 4,
      });
    }

    return NextResponse.json({ success: true, recommendations: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
