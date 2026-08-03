import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }

    const folderId = (formData.get("folderId") as string) || undefined;
    const altText = (formData.get("altText") as string) || undefined;
    const caption = (formData.get("caption") as string) || undefined;
    const tagsRaw = formData.get("tags") as string;
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
    const collectionsRaw = formData.get("collectionIds") as string;
    const collectionIds = collectionsRaw ? collectionsRaw.split(",").map(c => c.trim()).filter(Boolean) : [];

    const results: any[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await mediaService.uploadMedia({
        buffer,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        altText,
        caption,
        folderId,
        collectionIds,
        tags,
      });
      results.push(res);
    }

    return NextResponse.json({
      success: true,
      data: results.length === 1 ? results[0] : results,
    });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
