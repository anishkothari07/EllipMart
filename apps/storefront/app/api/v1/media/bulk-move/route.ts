export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { mediaIds, folderId } = await req.json();
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ success: false, error: "mediaIds array is required" }, { status: 400 });
    }

    const result = await mediaService.bulkMove(mediaIds, folderId || null);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

