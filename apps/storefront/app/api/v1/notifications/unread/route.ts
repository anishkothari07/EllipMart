export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;

    const where: any = { isRead: false };
    if (userId) where.recipientId = userId;

    const [unreadCount, items] = await Promise.all([
      db.notification.count({ where }),
      db.notification.findMany({
        where,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { actions: true },
      }),
    ]);

    return NextResponse.json({ success: true, unreadCount, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

