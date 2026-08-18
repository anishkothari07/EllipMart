import { cookies } from 'next/headers';
import { verifyRefreshToken } from './utils/jwt';
import { prisma } from '@corecart/database';

/**
 * Get the currently authenticated user from the unified session cookie.
 * The portal parameter is kept for backward compatibility but the unified
 * `ellipmart_session` cookie is always checked first.
 */
export async function getCurrentUser(portal?: string) {
  try {
    const cookieStore = await cookies();

    // Unified session cookie (new architecture)
    let token = cookieStore.get('ellipmart_session')?.value;

    // Fallback: legacy portal-specific cookies for backward compatibility
    if (!token) {
      if (portal === 'merchant' || portal === 'seller') {
        token = cookieStore.get('ellipmart_seller_refresh')?.value
          || cookieStore.get('ellipmart_merchant_refresh')?.value;
      } else if (portal === 'admin') {
        token = cookieStore.get('ellipmart_admin_refresh')?.value;
      } else {
        token = cookieStore.get('ellipmart_customer_refresh')?.value;
      }
    }

    if (!token) return null;

    const decoded = await verifyRefreshToken(token);
    if (!decoded || !decoded.userId) return null;

    if (decoded.sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { id: decoded.sessionId }
      });
      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        return null;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user || user.status !== 'ACTIVE') return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    return null;
  }
}

/** Requires authenticated user with ADMIN role (Super Admin portal). */
export async function requireAdminAccess() {
  const user = await getCurrentUser('admin');
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}

/**
 * @deprecated Use requireAdminAccess() instead.
 * Kept for backward compatibility with existing merchant app code.
 */
export async function requireMerchantAccess() {
  return requireAdminAccess();
}

/** Requires authenticated user with SELLER role (Seller portal). */
export async function requireSellerAccess() {
  const user = await getCurrentUser('seller');
  if (!user || user.role !== 'SELLER') {
    throw new Error('Unauthorized: Seller access required');
  }
  return user;
}

/** Requires authenticated user with ADMIN role and matching super admin email. */
export async function requireSuperAdminAccess() {
  const user = await getCurrentUser('admin');
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || 'super@corecart.com').split(',').map(e => e.trim());
  if (!user || user.role !== 'ADMIN' || !superAdminEmails.includes(user.email)) {
    throw new Error('Unauthorized: Super Admin access required');
  }
  return user;
}
