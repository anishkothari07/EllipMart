import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || undefined;
    const fileHash = searchParams.get("fileHash") || undefined;
    const folderIdParam = searchParams.get("folderId");
    const folderId = folderIdParam === "root" || folderIdParam === "null" ? null : folderIdParam || undefined;
    const collectionId = searchParams.get("collectionId") || undefined;
    const mimeType = searchParams.get("mimeType") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const dominantColor = searchParams.get("dominantColor") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 30;

    const result = await mediaService.searchMedia({
      query,
      fileHash,
      folderId,
      collectionId,
      mimeType,
      tag,
      dominantColor,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Media search error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
