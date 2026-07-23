import { cookies } from 'next/headers';
import { verifyRefreshToken } from './utils/jwt';
import { authRepository } from './modules/auth/auth.repository';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('refreshToken')?.value;

    if (!token) return null;

    const decoded = await verifyRefreshToken(token);
    if (!decoded || !decoded.userId) return null;

    if (decoded.sessionId) {
      const session = await authRepository.findSessionById(decoded.sessionId);
      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        return null;
      }
    }

    const user = await authRepository.findUserById(decoded.userId);
    if (!user || user.status !== 'ACTIVE') return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    return null;
  }
}
