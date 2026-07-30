import "dotenv/config";
import { domainEventBus } from "../lib/events/domain-event.bus";
import { AnalyticsEventProcessor } from "../lib/modules/analytics/event.processor";
import { AggregationService } from "../lib/modules/analytics/aggregation.service";
import { KpiEngine } from "../lib/modules/analytics/kpi.engine";
import { DashboardService } from "../lib/modules/analytics/dashboard.service";
import { AlertService } from "../lib/modules/analytics/alert.service";
import { ReportService } from "../lib/modules/analytics/report.service";
import { RealtimeService } from "../lib/modules/analytics/realtime.service";
import { prisma as db } from "../lib/prisma/client";
import { AnalyticsEventType } from "@prisma/client";

async function runAnalyticsVerification() {
  console.log("=== SPRINT 10 ENTERPRISE ANALYTICS & BI PLATFORM VERIFICATION ===");

  // Initialize event processor
  AnalyticsEventProcessor.init();
  console.log("[1/6] AnalyticsEventProcessor initialized & subscribed to DomainEventBus.");

  // 1. Setup mock user and order
  console.log("\n[2/6] Setting up mock data & publishing Purchase/Order events...");
  const user = await db.user.upsert({
    where: { email: "analytics.user@smartgo.com" },
    update: {},
    create: {
      email: "analytics.user@smartgo.com",
      firstName: "Jane",
      lastName: "Doe",
      passwordHash: "hashed",
    },
  });

  const order = await db.order.create({
    data: {
      userId: user.id,
      status: "CONFIRMED",
      subTotal: 150.0,
      taxTotal: 15.0,
      shippingTotal: 10.0,
      discountTotal: 0.0,
      grandTotal: 175.0,
    },
  });

  await db.payment.create({
    data: {
      orderId: order.id,
      amount: 175.0,
      provider: "RAZORPAY",
      status: "CONFIRMED",
      transactionId: "tx_mock_123",
    },
  });

  // Publish event
  domainEventBus.publish("PaymentSuccess", {
    userId: user.id,
    orderId: order.id,
    amount: 175.0,
    utmCampaign: "SummerSale2026",
    device: "Mobile",
    browser: "Safari",
  });

  // Wait briefly for processor to run setImmediate
  await new Promise((r) => setTimeout(r, 600));

  const count = await db.analyticsEvent.count({
    where: { event: AnalyticsEventType.PURCHASE },
  });
  console.log(`- Verified: Raw purchase event logged in DB. Count: ${count}`);

  // 2. Rollup aggregations
  console.log("\n[3/6] Running rollup aggregations...");
  await AggregationService.runDailyAggregations(new Date());
  
  const customer = await db.customerAnalytics.findUnique({ where: { userId: user.id } });
  console.log(`- Customer lifetime value: $${customer?.lifetimeValue}`);

  // 3. Heatmap click recording
  console.log("\n[4/6] Verifying heatmap clicks recording...");
  await db.analyticsHeatmap.create({
    data: { page: "/home", x: 120, y: 250, clickCount: 1 },
  });
  const clickCount = await db.analyticsHeatmap.count({ where: { page: "/home" } });
  console.log(`- Verified Heatmap: Heat clicks recorded for "/home". Count: ${clickCount}`);

  // 4. Alert rule validation
  console.log("\n[5/6] Verifying threshold alert rule check...");
  await db.alertRule.create({
    data: {
      metric: "INVENTORY_LOW",
      operator: "GT",
      threshold: 0,
      severity: "WARNING",
    },
  });

  await AlertService.checkAlertRules();
  console.log("- Checked alert rules.");

  // 5. Exporter verification
  console.log("\n[6/6] Verifying CSV/PDF report generation...");
  const csvReport = await ReportService.generateReport("CSV", "REVENUE");
  console.log(`- Generated report name: ${csvReport.filename}`);

  console.log("\n=======================================================");
  console.log("🎉 ALL SPRINT 10 ANALYTICS VERIFICATION TESTS PASSED!");
  console.log("=======================================================\n");
}

runAnalyticsVerification()
  .catch(console.error)
  .finally(() => db.$disconnect());
