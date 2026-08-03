import { prisma } from '@corecart/database';
import { TokenType } from '@prisma/client';
import type { User, Token, UserSession, Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async createToken(data: Prisma.TokenUncheckedCreateInput): Promise<Token> {
    return prisma.token.create({ data });
  }

  async findTokenByUserIdAndType(userId: string, type: TokenType): Promise<Token | null> {
    return prisma.token.findFirst({
      where: {
        userId,
        type,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markTokenUsed(tokenId: string): Promise<Token> {
    return prisma.token.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  async incrementTokenAttempts(tokenId: string): Promise<Token> {
    return prisma.token.update({
      where: { id: tokenId },
      data: { attempts: { increment: 1 } },
    });
  }

  async createUserSession(data: Prisma.UserSessionUncheckedCreateInput): Promise<UserSession> {
    return prisma.userSession.create({ data });
  }

  async findSessionByToken(token: string): Promise<UserSession | null> {
    return prisma.userSession.findUnique({ where: { token } });
  }

  async findSessionById(id: string): Promise<UserSession | null> {
    return prisma.userSession.findUnique({ where: { id } });
  }

  async revokeSession(id: string): Promise<UserSession> {
    return prisma.userSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async updateSessionActivity(id: string): Promise<void> {
    await prisma.userSession.update({
      where: { id },
      data: { lastActivity: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
