import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const metrics = await db.analyticsSalesMetrics.findMany({
      orderBy: { date: "desc" },
      take: 30,
    });
    const campaigns = await db.campaignMetrics.findMany({
      orderBy: { revenue: "desc" },
      take: 10,
    });
    return NextResponse.json({ success: true, sales: metrics, campaigns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
