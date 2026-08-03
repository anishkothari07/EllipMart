'use server';

import { authService } from '@corecart/commerce';
import { cookies } from 'next/headers';

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || 'super@corecart.com').split(',').map(e => e.trim());

export async function adminLoginAction(payload: any) {
  try {
    const result = await authService.login(payload, {});
    const isSuperAdmin = result.user.role === 'ADMIN' && SUPER_ADMIN_EMAILS.includes(result.user.email);
    
    if (!isSuperAdmin) {
      throw new Error('Unauthorized: Super Admin access required');
    }

    const cookieStore = await cookies();
    cookieStore.set('smartgo_admin_refresh', result.refreshToken, {
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

export async function adminLogoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('smartgo_admin_refresh');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
