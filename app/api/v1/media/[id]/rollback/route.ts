import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/lib/modules/media/media.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { versionNumber } = await req.json();

    if (!versionNumber) {
      return NextResponse.json({ success: false, error: "versionNumber is required" }, { status: 400 });
    }

    const result = await mediaService.rollbackVersion(id, Number(versionNumber));
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
