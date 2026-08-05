export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';

export async function GET() {
  try {
    const folders = await mediaService.getFolders();
    return NextResponse.json({ success: true, data: folders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, parentId } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, error: "name is required" }, { status: 400 });
    }
    const folder = await mediaService.createFolder(name, parentId);
    return NextResponse.json({ success: true, data: folder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

