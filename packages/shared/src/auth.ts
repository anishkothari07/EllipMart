import { cookies } from 'next/headers';
import { verifyRefreshToken } from './utils/jwt';
import { prisma } from '@corecart/database';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('refreshToken')?.value;

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
