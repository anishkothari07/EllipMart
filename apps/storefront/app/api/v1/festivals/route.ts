import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@corecart/database';

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
      data: activeCampaign || null,
    });
  } catch (error: any) {
    console.error("Festival campaign endpoint fallback:", error.message);
    return NextResponse.json({
      success: true,
      data: null,
    });
  }
}
