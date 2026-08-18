'use server';

import { MerchantDashboardService } from '@corecart/commerce/src/analytics/merchant-dashboard.service';
import { requireSellerAccess, getCurrentUser } from '@corecart/shared/src/auth';
import { authService } from '@corecart/commerce';
import { cookies } from 'next/headers';

export async function getSellerSessionAction() {
  try {
    const user = await getCurrentUser('seller');
    if (!user || user.role !== 'SELLER') return null;
    return user;
  } catch (e) {
    return null;
  }
}

export async function loginSellerAction(payload: any) {
  try {
    const result = await authService.login(payload, {});
    if (result.user.role !== 'SELLER') {
      throw new Error('Unauthorized: Seller access required');
    }

    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    };

    // Set unified session cookie and legacy cookie for compatibility
    cookieStore.set('ellipmart_session', result.refreshToken, cookieOptions);
    cookieStore.set('ellipmart_seller_refresh', result.refreshToken, cookieOptions);

    return { success: true, user: result.user };
  } catch (e: any) {
    return { success: false, error: e.message || 'Invalid credentials' };
  }
}

export async function logoutSellerAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('ellipmart_session');
    cookieStore.delete('ellipmart_seller_refresh');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchDashboardOverviewAction() {
  try {
    const user = await requireSellerAccess();
    const data = await MerchantDashboardService.getDashboardOverview(user.id);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard metrics' };
  }
}

export async function fetchDashboardWidgetsAction() {
  try {
    await requireAdminAccess();
    const data = await MerchantDashboardService.getDashboardWidgets();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard widget metrics' };
  }
}
