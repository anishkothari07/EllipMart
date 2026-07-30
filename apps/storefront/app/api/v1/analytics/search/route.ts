import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const searches = await db.analyticsSearchMetrics.findMany({
      orderBy: { count: "desc" },
      take: 20,
    });
    return NextResponse.json({ success: true, searches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
