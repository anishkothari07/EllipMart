import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  guestWishlist: z.array(z.string().uuid()).optional(),
  guestCart: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().min(1)
  })).optional(),
  referralCode: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
  guestWishlist: z.array(z.string().uuid()).optional(),
  guestCart: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().min(1)
  })).optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
