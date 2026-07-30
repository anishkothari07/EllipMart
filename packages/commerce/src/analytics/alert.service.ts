import { prisma as db } from '@corecart/database';
import { domainEventBus } from '@corecart/shared';

export class AlertService {
  static async checkAlertRules() {
    const rules = await db.alertRule.findMany({ where: { enabled: true } });
    
    for (const rule of rules) {
      let currentValue = 0;

      if (rule.metric === "INVENTORY_LOW") {
        const lowStock = await db.inventory?.count({
          where: { quantityAvailable: { lt: rule.threshold } }
        }) || 0;
        currentValue = lowStock;
      }

      // Check condition
      let triggered = false;
      if (rule.operator === "GT" && currentValue > rule.threshold) triggered = true;
      if (rule.operator === "LT" && currentValue < rule.threshold) triggered = true;
      if (rule.operator === "EQ" && currentValue === rule.threshold) triggered = true;

      if (triggered) {
        console.log(`[AlertService] Alert rule triggered: ${rule.metric} ${rule.operator} ${rule.threshold} (Actual: ${currentValue})`);
        
        domainEventBus.publish("SystemAlertTriggered", {
          metric: rule.metric,
          operator: rule.operator,
          threshold: rule.threshold,
          currentValue,
          severity: rule.severity,
        });
      }
    }
  }
}
