export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const settings = await db.notificationSetting.findMany({
      where: { userId },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, category, channel, enabled } = await req.json();

    if (!userId || !category || !channel) {
      return NextResponse.json({ success: false, error: "userId, category, and channel are required" }, { status: 400 });
    }

    const setting = await db.notificationSetting.upsert({
      where: {
        userId_category_channel: {
          userId,
          category: category as any,
          channel: channel as any,
        },
      },
      update: { enabled: !!enabled },
      create: {
        userId,
        category: category as any,
        channel: channel as any,
        enabled: !!enabled,
      },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

