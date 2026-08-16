'use server';

import { MerchantDashboardService } from '@corecart/commerce/src/analytics/merchant-dashboard.service';
import { requireMerchantAccess, getCurrentUser } from '@corecart/shared/src/auth';
import { authService } from '@corecart/commerce';
import { cookies } from 'next/headers';

export async function getMerchantSessionAction() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') return null;
    return user;
  } catch (e) {
    return null;
  }
}

export async function loginMerchantAction(payload: any) {
  try {
    const result = await authService.login(payload, {});
    if (result.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Merchant access required');
    }

    const cookieStore = await cookies();
    cookieStore.set('ellipmart_merchant_refresh', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return { success: true, user: result.user };
  } catch (e: any) {
    return { success: false, error: e.message || 'Invalid credentials' };
  }
}

export async function logoutMerchantAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('ellipmart_merchant_refresh');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchDashboardOverviewAction() {
  try {
    await requireMerchantAccess();
    const data = await MerchantDashboardService.getDashboardOverview();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard metrics' };
  }
}

export async function fetchDashboardWidgetsAction() {
  try {
    await requireMerchantAccess();
    const data = await MerchantDashboardService.getDashboardWidgets();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard widget metrics' };
  }
}
