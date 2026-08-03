import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
      },
      take: 50,
    });
    return NextResponse.json({ success: true, inventory: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
