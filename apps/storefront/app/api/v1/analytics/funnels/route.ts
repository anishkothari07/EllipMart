export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const funnels = await db.analyticsFunnel.findMany({
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ success: true, funnels });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

