import { cookies } from 'next/headers';
import { verifyRefreshToken } from './utils/jwt';
import { prisma } from '@corecart/database';

export async function getCurrentUser(portal: 'storefront' | 'merchant' | 'admin' = 'storefront') {
  try {
    const cookieStore = await cookies();

    let cookieName = 'ellipmart_customer_refresh';
    if (portal === 'merchant') cookieName = 'ellipmart_merchant_refresh';
    if (portal === 'admin') cookieName = 'ellipmart_admin_refresh';

    const token = cookieStore.get(cookieName)?.value;

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

export async function requireMerchantAccess() {
  const user = await getCurrentUser('merchant');
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Merchant access required');
  }
  return user;
}

export async function requireSuperAdminAccess() {
  const user = await getCurrentUser('admin');
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || 'super@corecart.com').split(',').map(e => e.trim());
  if (!user || user.role !== 'ADMIN' || !superAdminEmails.includes(user.email)) {
    throw new Error('Unauthorized: Super Admin access required');
  }
  return user;
}
