import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const activeCampaign = await prisma.festivalCampaign.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        banners: true,
        homepageLayouts: true,
        coupons: true,
        collections: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: activeCampaign,
    });
  } catch (error: any) {
    console.error("Failed to fetch active festival campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
