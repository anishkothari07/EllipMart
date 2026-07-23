import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma/client";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const where: any = { isRead: false };
    if (userId) where.recipientId = userId;

    const res = await db.notification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true, count: res.count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
