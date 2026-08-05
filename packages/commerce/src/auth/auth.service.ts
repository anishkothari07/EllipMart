import { authRepository } from './auth.repository';
import { emailService } from '../services/email.service';
import { hashPassword, comparePassword } from '@corecart/shared';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@corecart/shared';
import { env } from '@corecart/shared';
import { AppError } from '@corecart/shared';
import { z } from 'zod';
import { loginSchema, registerSchema, verifyEmailSchema, resetPasswordSchema, forgotPasswordSchema, refreshSchema } from './auth.dto';
import crypto from 'crypto';
import { prisma } from '@corecart/database';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// In-memory store for development mode OTP testing
if (process.env.NODE_ENV !== 'production') {
  (global as any).__devOtps = (global as any).__devOtps || new Map<string, string>();
}

export class AuthService {
  async register(payload: z.infer<typeof registerSchema>, reqMeta: { ip?: string, userAgent?: string }) {
    console.log("AuthService.register() executing for:", payload.email);
    const existing = await authRepository.findUserByEmail(payload.email);
    if (existing) {
      console.log("Error: Email already registered");
      throw new AppError('Email already registered', 400, 'DUPLICATE_EMAIL');
    }

    console.log("Creating user...");
    const passwordHash = await hashPassword(payload.password);
    
    try {
      const user = await authRepository.createUser({
        email: payload.email,
        passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        cart: { create: {} },
        wishlist: { create: {} },
      });
      console.log("User created in database with ID:", user.id);

      if (payload.guestWishlist?.length) {
        console.log("Syncing guest wishlist...");
        const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
        if (wishlist) {
          for (const productId of payload.guestWishlist) {
            try {
              await prisma.wishlistItem.upsert({
                where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
                update: {},
                create: { wishlistId: wishlist.id, productId }
              });
            } catch(e) {}
          }
        }
      }

      if (payload.guestCart?.length) {
        console.log("Syncing guest cart...");
        const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
        if (cart) {
          for (const item of payload.guestCart) {
            try {
              if (item.variantId) {
                await prisma.cartItem.upsert({
                  where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
                  update: { quantity: { increment: item.quantity } },
                  create: { cartId: cart.id, variantId: item.variantId, quantity: item.quantity }
                });
              }
            } catch(e) {}
          }
        }
      }

      // DEVELOPMENT MODE: Do not generate OTP or send email
      // await this.sendVerificationOTP(user.id, user.email);

      // Auto-login
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const session = await authRepository.createUserSession({
        userId: user.id,
        token: sessionToken,
        ip: reqMeta?.ip || 'unknown',
        userAgent: reqMeta?.userAgent || 'unknown',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      const accessToken = await signAccessToken({ userId: user.id, role: user.role, email: user.email, sessionId: session.id });
      const refreshToken = await signRefreshToken({ userId: user.id, role: user.role, email: user.email, sessionId: session.id });

      await authRepository.updateUser(user.id, { lastLoginAt: new Date() });

      // Safe user object for response
      const safeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status
      };

      return { user: safeUser, accessToken, refreshToken };
    } catch (e: any) {
      console.error("Prisma user.create() or sync failed with error:", e);
      throw e;
    }
  }

  async sendVerificationOTP(userId: string, email: string) {
    console.log("Creating OTP for user ID:", userId);
    const otp = generateOTP();
    const hash = await hashPassword(otp);

    try {
      await authRepository.createToken({
        userId,
        type: 'EMAIL_VERIFICATION',
        hash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      });
      console.log("OTP created in Token table");

      if (process.env.NODE_ENV !== 'production') {
        (global as any).__devOtps.set(email, otp);
      }

      console.log("Sending email to:", email);
      await emailService.sendEmail({
        to: email,
        subject: 'Verify your email',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`,
      });
      console.log("Email sent successfully");
    } catch (e: any) {
      console.error("Failed to send email. Falling back to DEVELOPMENT MODE. OTP is:", otp);
      console.error("SMTP Error:", e);
      if (process.env.NODE_ENV === 'production') {
        throw e;
      }
    }
  }

  async verifyEmail(payload: z.infer<typeof verifyEmailSchema>) {
    const user = await authRepository.findUserByEmail(payload.email);
    if (!user) throw new AppError('User not found', 404);

    const token = await authRepository.findTokenByUserIdAndType(user.id, 'EMAIL_VERIFICATION');
    if (!token) throw new AppError('No pending verification found', 400);

    if (token.expiresAt < new Date()) {
      throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
    }

    if (token.attempts >= 3) {
      throw new AppError('Too many failed attempts. Request a new OTP', 400, 'MAX_ATTEMPTS');
    }

    const isValid = await comparePassword(payload.otp, token.hash);
    if (!isValid) {
      await authRepository.incrementTokenAttempts(token.id);
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }

    await authRepository.markTokenUsed(token.id);
    await authRepository.updateUser(user.id, {
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });

    return { success: true };
  }

  async login(payload: z.infer<typeof loginSchema>, reqMeta: { ip?: string, userAgent?: string }) {
    console.log('[DEBUG] AuthService.login() called for email:', payload.email);
    console.log('[DEBUG] Attempting to find user by email...');
    
    const user = await authRepository.findUserByEmail(payload.email);
    
    if (!user) {
      console.log('[DEBUG] User not found for email:', payload.email);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }
    
    console.log('[DEBUG] User found');
    console.log('[DEBUG] User ID:', user.id);
    console.log('[DEBUG] Email:', user.email);
    console.log('[DEBUG] Status:', user.status);
    console.log('[DEBUG] Password hash prefix:', user.passwordHash?.substring(0, 10), '... Length:', user.passwordHash?.length);

    if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
      console.log('[DEBUG] Login rejected because status is:', user.status);
      throw new AppError('Account is restricted', 403, 'ACCOUNT_RESTRICTED');
    }
    if (user.status === 'DELETED') {
      console.log('[DEBUG] Login rejected because status is DELETED');
      throw new AppError('Account not found', 404);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      console.log('[DEBUG] Login rejected because account is locked until:', user.lockedUntil);
      throw new AppError('Account locked due to multiple failed attempts', 403, 'ACCOUNT_LOCKED');
    }

    if (!user.passwordHash) {
      console.log('[DEBUG] Login rejected because user has no passwordHash (likely OAuth account)');
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    console.log('[DEBUG] Calling bcrypt.compare with incoming password and stored hash...');
    const isMatch = await comparePassword(payload.password, user.passwordHash);
    console.log('[DEBUG] bcrypt.compare() result:', isMatch);

    if (!isMatch) {
      console.log('[DEBUG] Password does not match. Incrementing failed login attempts.');
      const attempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;
      if (attempts >= env.MAX_LOGIN_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + env.LOCK_DURATION_MINUTES * 60 * 1000);
        console.log('[DEBUG] Max attempts reached, locking account until:', lockedUntil);
      }
      await authRepository.updateUser(user.id, { failedLoginAttempts: attempts, lockedUntil });
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Success
    console.log('[DEBUG] Password matched. Resetting failed attempts and updating lastLoginAt...');
    try {
      await authRepository.updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() });
    } catch(e) {
      console.log('[DEBUG] Failed to update user lastLoginAt:', e);
    }

    // Sync guest data
    console.log('[DEBUG] Syncing guest data...');
    if (payload.guestWishlist?.length) {
      const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
      if (wishlist) {
        for (const productId of payload.guestWishlist) {
          try {
            await prisma.wishlistItem.upsert({
              where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
              update: {},
              create: { wishlistId: wishlist.id, productId }
            });
          } catch(e) {}
        }
      }
    }

    if (payload.guestCart?.length) {
      const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (cart) {
        for (const item of payload.guestCart) {
          try {
            if (item.variantId) {
              await prisma.cartItem.upsert({
                where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
                update: { quantity: { increment: item.quantity } },
                create: { cartId: cart.id, variantId: item.variantId, quantity: item.quantity }
              });
            }
          } catch(e) {}
        }
      }
    }

    // Create session mapping
    console.log('[DEBUG] Creating session...');
    const sessionToken = crypto.randomBytes(32).toString('hex');
    let session;
    try {
      session = await authRepository.createUserSession({
        userId: user.id,
        token: sessionToken,
        ip: reqMeta.ip,
        userAgent: reqMeta.userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      console.log('[DEBUG] Session created successfully, session ID:', session?.id);
    } catch(e) {
      console.log('[DEBUG] Failed to create session. Prisma error:', e);
      throw e;
    }

    console.log('[DEBUG] Generating JWTs...');
    let accessToken;
    let refreshToken;
    try {
      accessToken = await signAccessToken({ userId: user.id, role: user.role, email: user.email, sessionId: session.id });
      refreshToken = await signRefreshToken({ userId: user.id, role: user.role, email: user.email, sessionId: session.id });
      console.log('[DEBUG] JWTs generated successfully');
    } catch(e) {
      console.log('[DEBUG] Failed to generate JWTs:', e);
      throw e;
    }

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, status: user.status } };
  }

  async refresh(payload: z.infer<typeof refreshSchema>) {
    const decoded = await verifyRefreshToken(payload.refreshToken).catch(() => {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    });

    if (!decoded.sessionId) throw new AppError('Invalid token format', 401);

    const session = await authRepository.findSessionById(decoded.sessionId);
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError('Session expired or revoked', 401, 'SESSION_EXPIRED');
    }

    const user = await authRepository.findUserById(session.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Account restricted', 403);
    }

    await authRepository.updateSessionActivity(session.id);

    const accessToken = await signAccessToken({ userId: user.id, role: user.role, email: user.email, sessionId: session.id });
    return { accessToken };
  }

  async logout(sessionId: string) {
    await authRepository.revokeSession(sessionId);
    return { success: true };
  }

  async logoutAll(userId: string) {
    await authRepository.revokeAllUserSessions(userId);
    return { success: true };
  }

  async forgotPassword(payload: z.infer<typeof forgotPasswordSchema>) {
    const user = await authRepository.findUserByEmail(payload.email);
    if (!user) return { success: true }; // Prevent email enumeration

    const otp = generateOTP();
    const hash = await hashPassword(otp);

    // DEVELOPMENT MODE: Do not send email
    // await authRepository.createToken({ ... });
    // await emailService.sendEmail({ ... });
    
    return { success: true };
  }

  async resetPassword(payload: z.infer<typeof resetPasswordSchema>) {
    const user = await authRepository.findUserByEmail(payload.email);
    if (!user) throw new AppError('User not found', 404);

    const passwordHash = await hashPassword(payload.newPassword);
    
    // DEVELOPMENT MODE: Bypass OTP checks
    /*
    const token = await authRepository.findTokenByUserIdAndType(user.id, 'PASSWORD_RESET');
    if (!token) throw new AppError('No pending reset found', 400);

    if (token.expiresAt < new Date()) {
      throw new AppError('OTP expired', 400, 'OTP_EXPIRED');
    }

    if (token.attempts >= 3) {
      throw new AppError('Too many failed attempts. Request a new OTP', 400, 'MAX_ATTEMPTS');
    }

    const isValid = await comparePassword(payload.otp, token.hash);
    if (!isValid) {
      await authRepository.incrementTokenAttempts(token.id);
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }
    await authRepository.markTokenUsed(token.id);
    */

    await authRepository.updateUser(user.id, { passwordHash });
    
    // Invalidate all existing sessions after password reset
    await authRepository.revokeAllUserSessions(user.id);

    return { success: true };
  }
}

export const authService = new AuthService();



import { NextRequest } from 'next/server';

export async function getAuthUser(req: NextRequest) {
  // Simplified for sprint 4 - normally decodes bearer token from req headers
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verifyRefreshToken(token); // Or verifyAccessToken if implemented
    const user = await authRepository.findUserById(decoded.userId);
    return user && user.status === 'ACTIVE' ? user : null;
  } catch (e) {
    return null;
  }
}
