import { prisma as db } from "@/lib/prisma/client";
import { KpiEngine } from "./kpi.engine";

export class DashboardService {
  static async getDashboardOverview(start: Date, end: Date) {
    const cacheKey = `dashboard_overview_${start.getTime()}_${end.getTime()}`;

    // Try cache
    const cached = await db.analyticsDashboardCache.findUnique({
      where: { key: cacheKey },
    });

    if (cached && cached.expiresAt > new Date()) {
      return JSON.parse(cached.value);
    }

    // Calculate core KPIs
    const [revenue, netRevenue, aov, conversionRate, bounceRate] = await Promise.all([
      KpiEngine.calculateRevenue(start, end),
      KpiEngine.calculateNetRevenue(start, end),
      KpiEngine.calculateAov(start, end),
      KpiEngine.calculateConversionRate(start, end),
      KpiEngine.calculateBounceRate(start, end),
    ]);

    const ordersCount = await db.order.count({
      where: { createdAt: { gte: start, lte: end } },
    });

    // Top Products
    const topProducts = await db.analyticsProductMetrics.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { revenue: "desc" },
      take: 5,
    });

    const result = {
      kpis: {
        revenue,
        netRevenue,
        ordersCount,
        aov,
        conversionRate,
        bounceRate,
      },
      topProducts,
    };

    // Cache for 5 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await db.analyticsDashboardCache.upsert({
      where: { key: cacheKey },
      update: { value: JSON.stringify(result), expiresAt },
      create: { key: cacheKey, value: JSON.stringify(result), expiresAt },
    });

    return result;
  }
}
