import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mediaId = formData.get("mediaId") as string;
    const file = formData.get("file") as File;

    if (!mediaId || !file) {
      return NextResponse.json({ success: false, error: "mediaId and file are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const updated = await mediaService.replaceMedia(mediaId, buffer, file.name, file.type || "application/octet-stream");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Replace media error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
