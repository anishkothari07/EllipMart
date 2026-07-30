import { prisma as db } from '@corecart/database';

export class KpiEngine {
  static async calculateRevenue(start: Date, end: Date): Promise<number> {
    const res = await db.payment.aggregate({
      where: {
        status: "CAPTURED",
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    return Number(res._sum.amount || 0);
  }

  static async calculateNetRevenue(start: Date, end: Date): Promise<number> {
    const rev = await this.calculateRevenue(start, end);
    const refunds = await db.refund?.aggregate({
      where: { createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }) || { _sum: { amount: null } };
    const refAmount = Number(refunds._sum.amount || 0);
    return rev - refAmount;
  }

  static async calculateAov(start: Date, end: Date): Promise<number> {
    const ordersCount = await db.order.count({
      where: { createdAt: { gte: start, lte: end } },
    });
    if (ordersCount === 0) return 0;
    const rev = await this.calculateRevenue(start, end);
    return rev / ordersCount;
  }

  static async calculateConversionRate(start: Date, end: Date): Promise<number> {
    const sessions = await db.analyticsSession.count({
      where: { startedAt: { gte: start, lte: end } },
    });
    if (sessions === 0) return 0;
    const orders = await db.order.count({
      where: { createdAt: { gte: start, lte: end } },
    });
    return (orders / sessions) * 100;
  }

  static async calculateBounceRate(start: Date, end: Date): Promise<number> {
    const totalSessions = await db.analyticsSession.count({
      where: { startedAt: { gte: start, lte: end } },
    });
    if (totalSessions === 0) return 0;
    const bounceSessions = await db.analyticsSession.count({
      where: {
        startedAt: { gte: start, lte: end },
        pageViews: 1,
      },
    });
    return (bounceSessions / totalSessions) * 100;
  }

  static async calculateRefundRate(start: Date, end: Date): Promise<number> {
    const rev = await this.calculateRevenue(start, end);
    if (rev === 0) return 0;
    const refunds = await db.refund?.aggregate({
      where: { createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }) || { _sum: { amount: null } };
    const refAmount = refunds._sum.amount || 0;
    return (refAmount / rev) * 100;
  }
}
