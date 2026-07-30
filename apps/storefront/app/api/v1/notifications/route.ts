import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';
import { NotificationCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const category = (searchParams.get("category") as NotificationCategory) || undefined;
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.recipientId = userId;
    if (category) where.category = category;
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { actions: true },
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { ...(userId ? { recipientId: userId } : {}), isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
