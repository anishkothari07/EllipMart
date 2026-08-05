export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { ReportService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { format, metric } = await req.json();
    if (!format || !metric) {
      return NextResponse.json({ success: false, error: "format and metric are required" }, { status: 400 });
    }
    const report = await ReportService.generateReport(format, metric);
    return NextResponse.json({ success: true, ...report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

