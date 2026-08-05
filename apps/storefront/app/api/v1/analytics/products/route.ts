export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const metrics = await db.analyticsProductMetrics.findMany({
      orderBy: { views: "desc" },
      take: 20,
    });
    return NextResponse.json({ success: true, products: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

