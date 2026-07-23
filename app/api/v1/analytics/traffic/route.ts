import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const traffic = await db.analyticsTrafficMetrics.findMany({
      orderBy: { date: "desc" },
      take: 30,
    });
    const heatmaps = await db.analyticsHeatmap.findMany({
      orderBy: { clickCount: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, traffic, heatmaps });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { page, x, y } = await req.json();
    if (!page) {
      return NextResponse.json({ success: false, error: "page is required" }, { status: 400 });
    }
    const heatmap = await db.analyticsHeatmap.create({
      data: { page, x, y },
    });
    return NextResponse.json({ success: true, heatmap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
