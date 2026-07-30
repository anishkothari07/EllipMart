import { NextRequest, NextResponse } from "next/server";
import { mediaService } from '@corecart/commerce';
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const media = await db.media.findUnique({
      where: { id },
      include: {
        variants: true,
        versions: { orderBy: { versionNumber: "desc" } },
        usages: true,
        folder: true,
        tags: { include: { tag: true } },
        collections: { include: { collection: true } },
      },
    });

    if (!media) {
      return NextResponse.json({ success: false, error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: media });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const media = await db.media.update({
      where: { id },
      data: {
        alt: body.altText !== undefined ? body.altText : undefined,
        caption: body.caption !== undefined ? body.caption : undefined,
        focusX: body.focusX !== undefined ? body.focusX : undefined,
        focusY: body.focusY !== undefined ? body.focusY : undefined,
        folderId: body.folderId !== undefined ? body.folderId : undefined,
        visibility: body.visibility !== undefined ? body.visibility : undefined,
      },
    });

    return NextResponse.json({ success: true, data: media });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const result = await mediaService.deleteMedia(id, force);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
