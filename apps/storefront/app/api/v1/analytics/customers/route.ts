export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const customers = await db.customerAnalytics.findMany({
      orderBy: { lifetimeValue: "desc" },
      take: 20,
    });
    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

