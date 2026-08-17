'use server';

import { authService } from '@corecart/commerce';
import { getCurrentUser } from '@corecart/shared/src/auth';
import { cookies } from 'next/headers';

export async function sellerLoginAction(payload: { email: string; password: string }) {
  try {
    const result = await authService.login(payload, {});

    if (result.user.role !== 'MERCHANT') {
      throw new Error('Unauthorized: Seller access only.');
    }

    const cookieStore = await cookies();
    cookieStore.set('ellipmart_seller_refresh', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return { success: true, user: result.user };
  } catch (e: any) {
    return { success: false, error: e.message || 'Invalid credentials' };
  }
}

export async function sellerLogoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('ellipmart_seller_refresh');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getSellerSessionAction() {
  try {
    const user = await getCurrentUser('seller');
    if (!user || user.role !== 'MERCHANT') return null;
    return user;
  } catch {
    return null;
  }
}
