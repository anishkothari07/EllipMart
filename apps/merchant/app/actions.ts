'use server';

import { MerchantDashboardService } from '@corecart/commerce/src/analytics/merchant-dashboard.service';

export async function fetchDashboardOverviewAction() {
  try {
    const data = await MerchantDashboardService.getDashboardOverview();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard metrics' };
  }
}

export async function fetchDashboardWidgetsAction() {
  try {
    const data = await MerchantDashboardService.getDashboardWidgets();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard widget metrics' };
  }
}
