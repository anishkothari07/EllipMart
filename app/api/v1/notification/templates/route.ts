import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma/client";

export async function GET() {
  try {
    const templates = await db.notificationTemplate.findMany({
      include: { versions: { orderBy: { version: "desc" } } },
      orderBy: { event: "asc" },
    });

    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, channel, category, name, subject, html, text, variables } = body;

    if (!event || !channel || !name) {
      return NextResponse.json({ success: false, error: "event, channel, and name are required" }, { status: 400 });
    }

    const template = await db.notificationTemplate.upsert({
      where: { event_channel: { event, channel } },
      update: {
        name,
        category,
        subject,
        html,
        text,
        variables: typeof variables === "string" ? variables : JSON.stringify(variables || []),
      },
      create: {
        event,
        channel,
        category,
        name,
        subject,
        html,
        text,
        variables: typeof variables === "string" ? variables : JSON.stringify(variables || []),
        currentVersion: 1,
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
