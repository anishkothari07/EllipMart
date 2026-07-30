import { prisma as db } from '@corecart/database';
import { AnalyticsEventType } from "@prisma/client";

export class AggregationService {
  /**
   * Run all daily aggregations for a specific date
   */
  static async runDailyAggregations(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`[AggregationService] Running daily rollups for ${startOfDay.toISOString().split("T")[0]}`);

    await Promise.all([
      this.aggregateProducts(startOfDay, endOfDay),
      this.aggregateCategories(startOfDay, endOfDay),
      this.aggregateSales(startOfDay, endOfDay),
      this.aggregateTraffic(startOfDay, endOfDay),
      this.aggregateCampaigns(),
      this.aggregateCustomer360(),
    ]);
  }

  private static async aggregateProducts(start: Date, end: Date) {
    const views = await db.analyticsEvent.groupBy({
      by: ["entityId"],
      where: {
        event: AnalyticsEventType.PRODUCT_VIEW,
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    const purchases = await db.analyticsEvent.groupBy({
      by: ["entityId"],
      where: {
        event: AnalyticsEventType.PURCHASE,
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    for (const v of views) {
      if (!v.entityId) continue;
      const purchaseCount = purchases.find((p) => p.entityId === v.entityId)?._count || 0;
      
      await db.analyticsProductMetrics.upsert({
        where: {
          productId_date: {
            productId: v.entityId,
            date: start,
          },
        },
        update: {
          views: v._count,
          purchases: purchaseCount,
          conversionRate: v._count > 0 ? (purchaseCount / v._count) * 100 : 0,
        },
        create: {
          productId: v.entityId,
          date: start,
          views: v._count,
          purchases: purchaseCount,
          conversionRate: v._count > 0 ? (purchaseCount / v._count) * 100 : 0,
          embeddingReady: false,
          summaryReady: false,
          anomalyScore: 0.0,
          forecastReady: false,
        },
      });
    }
  }

  private static async aggregateCategories(start: Date, end: Date) {
    const views = await db.analyticsEvent.groupBy({
      by: ["category"],
      where: {
        event: AnalyticsEventType.PRODUCT_VIEW,
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    for (const v of views) {
      if (!v.category) continue;
      await db.analyticsCategoryMetrics.upsert({
        where: {
          categoryId_date: {
            categoryId: v.category,
            date: start,
          },
        },
        update: {
          views: v._count,
        },
        create: {
          categoryId: v.category,
          date: start,
          views: v._count,
          revenue: 0.0,
          orders: 0,
          conversionRate: 0.0,
        },
      });
    }
  }

  private static async aggregateSales(start: Date, end: Date) {
    const ordersCount = await db.order.count({
      where: { createdAt: { gte: start, lte: end } },
    });

    const revenueSum = await db.payment.aggregate({
      where: {
        status: "CAPTURED",
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    const totalRev = Number(revenueSum._sum.amount || 0);

    await db.analyticsSalesMetrics.upsert({
      where: { date: start },
      update: {
        orders: ordersCount,
        revenue: totalRev,
        aov: ordersCount > 0 ? totalRev / ordersCount : 0,
        netRevenue: totalRev,
      },
      create: {
        date: start,
        orders: ordersCount,
        revenue: totalRev,
        aov: ordersCount > 0 ? totalRev / ordersCount : 0,
        netRevenue: totalRev,
      },
    });
  }

  private static async aggregateTraffic(start: Date, end: Date) {
    const sessionCount = await db.analyticsSession.count({
      where: { startedAt: { gte: start, lte: end } },
    });

    await db.analyticsTrafficMetrics.upsert({
      where: { date: start },
      update: {
        sessions: sessionCount,
      },
      create: {
        date: start,
        sessions: sessionCount,
        users: sessionCount,
      },
    });
  }

  private static async aggregateCampaigns() {
    const events = await db.analyticsEvent.findMany({
      where: { utmCampaign: { not: null } },
    });

    const campaignsMap = new Map<string, { sessions: number; orders: number; revenue: number }>();
    
    for (const ev of events) {
      const camp = ev.utmCampaign!;
      if (!campaignsMap.has(camp)) {
        campaignsMap.set(camp, { sessions: 0, orders: 0, revenue: 0 });
      }
      const data = campaignsMap.get(camp)!;
      if (ev.event === AnalyticsEventType.PAGE_VIEW || ev.event === AnalyticsEventType.PRODUCT_VIEW) {
        data.sessions++;
      } else if (ev.event === AnalyticsEventType.PURCHASE) {
        data.orders++;
        try {
          const props = JSON.parse(ev.properties || "{}");
          data.revenue += Number(props.amount || 0);
        } catch {}
      }
    }

    for (const [campaign, metrics] of campaignsMap.entries()) {
      await db.campaignMetrics.upsert({
        where: { campaign },
        update: {
          sessions: metrics.sessions,
          orders: metrics.orders,
          revenue: metrics.revenue,
          conversionRate: metrics.sessions > 0 ? (metrics.orders / metrics.sessions) * 100 : 0,
        },
        create: {
          campaign,
          sessions: metrics.sessions,
          orders: metrics.orders,
          revenue: metrics.revenue,
          conversionRate: metrics.sessions > 0 ? (metrics.orders / metrics.sessions) * 100 : 0,
        },
      });
    }
  }

  private static async aggregateCustomer360() {
    const users = await db.user.findMany({
      include: {
        orders: {
          include: { payment: true }
        }
      }
    });

    for (const u of users) {
      const orders = u.orders || [];
      const totalOrders = orders.length;
      let totalRevenue = 0;

      orders.forEach(o => {
        if (o.payment && o.payment.status === "CAPTURED") {
          totalRevenue += Number(o.payment.amount);
        }
      });

      const firstPurchase = orders.length > 0 ? orders[orders.length - 1].createdAt : null;
      const lastPurchase = orders.length > 0 ? orders[0].createdAt : null;
      const daysSinceLastPurchase = lastPurchase 
        ? Math.floor((Date.now() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      await db.customerAnalytics.upsert({
        where: { userId: u.id },
        update: {
          totalOrders,
          totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          lifetimeValue: totalRevenue,
          firstPurchaseAt: firstPurchase,
          lastPurchaseAt: lastPurchase,
          daysSinceLastPurchase,
        },
        create: {
          userId: u.id,
          totalOrders,
          totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          lifetimeValue: totalRevenue,
          firstPurchaseAt: firstPurchase,
          lastPurchaseAt: lastPurchase,
          daysSinceLastPurchase,
        }
      });
    }
  }
}
