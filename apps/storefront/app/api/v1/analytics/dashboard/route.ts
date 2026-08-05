export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { DashboardService } from '@corecart/commerce';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    const end = new Date();
    const start = new Date();
    if (range === "7d") start.setDate(start.getDate() - 7);
    else if (range === "90d") start.setDate(start.getDate() - 90);
    else start.setDate(start.getDate() - 30);

    const data = await DashboardService.getDashboardOverview(start, end);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

