export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { mediaIds, force } = await req.json();
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ success: false, error: "mediaIds array is required" }, { status: 400 });
    }

    const results = await mediaService.bulkDelete(mediaIds, !!force);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

