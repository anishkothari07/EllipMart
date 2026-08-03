import { prisma as db } from '@corecart/database';

export class ReportService {
  static async generateReport(format: "CSV" | "EXCEL" | "PDF", metric: string): Promise<{ data: string; filename: string }> {
    console.log(`[ReportService] Generating ${format} report for metric: ${metric}`);

    const events = await db.analyticsEvent.findMany({ take: 100 });
    
    let content = "";
    if (format === "CSV" || format === "EXCEL") {
      content = "Event ID,Event Type,User ID,Session ID,Created At\n";
      events.forEach((ev: any) => {
        content += `${ev.id},${ev.event},${ev.userId || "guest"},${ev.sessionId || "none"},${ev.createdAt.toISOString()}\n`;
      });
    } else {
      content = `--- SMARTGO BI ANALYTICS PDF REPORT ---\nMetric: ${metric}\nGenerated At: ${new Date().toISOString()}\n\n`;
      events.forEach((ev: any) => {
        content += `[${ev.createdAt.toISOString()}] Event: ${ev.event} | User: ${ev.userId || "guest"}\n`;
      });
    }

    return {
      data: content,
      filename: `report_${metric.toLowerCase()}_${Date.now()}.${format.toLowerCase() === "excel" ? "xlsx" : format.toLowerCase()}`,
    };
  }
}
