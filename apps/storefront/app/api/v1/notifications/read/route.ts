export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function PATCH(req: NextRequest) {
  try {
    const { notificationIds, notificationId } = await req.json();
    const ids = notificationIds || (notificationId ? [notificationId] : []);

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: "notificationIds array or notificationId is required" }, { status: 400 });
    }

    await db.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

