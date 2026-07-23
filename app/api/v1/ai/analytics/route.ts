import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma/client";
import { AIService } from "@/lib/modules/ai/ai.service";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ success: false, error: "query is required" }, { status: 400 });
    }

    const metrics = await db.analyticsSalesMetrics.findMany({
      orderBy: { date: "desc" },
      take: 10,
    });

    const context = `Recent Daily Sales Metrics:\n${metrics.map((m) => `Date: ${m.date.toISOString().split("T")[0]}, Orders: ${m.orders}, Revenue: $${m.revenue}, Refunds: $${m.refunds}`).join("\n")}`;

    const answer = await AIService.generateText("CHAT_ASSISTANT", query, context);

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
