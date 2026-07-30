import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';

export async function GET() {
  try {
    const collections = await mediaService.getCollections();
    return NextResponse.json({ success: true, data: collections });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, error: "name is required" }, { status: 400 });
    }
    const collection = await mediaService.createCollection(name, description);
    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
