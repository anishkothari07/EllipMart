import { NextRequest } from 'next/server';
import { authService } from '@corecart/commerce';
import { resetPasswordSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { checkRateLimit } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`resetpwd:${ip}`, 5, 60000 * 15)) {
    throw new AppError('Too many requests', 429, 'RATE_LIMIT');
  }

  const body = await req.json();
  const parsed = resetPasswordSchema.parse(body);

  const result = await authService.resetPassword(parsed);

  return successResponse(result, 'Password reset successful. You can now login.');
}
