import { prisma as db } from '@corecart/database';
import { NotificationChannel, NotificationStatus } from "@prisma/client";

export class NotificationAnalytics {
  /**
   * Get delivery metrics summary across channels
   */
  static async getSummary() {
    const [totalSent, totalFailed, totalDead, logs] = await Promise.all([
      db.notification.count({ where: { status: NotificationStatus.SENT } }),
      db.notification.count({ where: { status: NotificationStatus.FAILED } }),
      db.notification.count({ where: { status: NotificationStatus.DEAD } }),
      db.notificationLog.findMany({ take: 500, orderBy: { createdAt: "desc" } }),
    ]);

    const totalLatency = logs.reduce((sum, l) => sum + l.latencyMs, 0);
    const avgLatencyMs = logs.length > 0 ? Math.round(totalLatency / logs.length) : 0;

    const channelBreakdown: Record<string, { sent: number; failed: number }> = {};
    for (const log of logs) {
      if (!channelBreakdown[log.channel]) {
        channelBreakdown[log.channel] = { sent: 0, failed: 0 };
      }
      if (log.status === NotificationStatus.SENT) {
        channelBreakdown[log.channel].sent++;
      } else {
        channelBreakdown[log.channel].failed++;
      }
    }

    return {
      totalSent,
      totalFailed,
      totalDead,
      avgLatencyMs,
      channelBreakdown,
    };
  }
}
