import { NextRequest } from 'next/server';
import { authService } from '../../../../../lib/modules/auth/auth.service';
import { resendVerificationSchema } from '../../../../../lib/modules/auth/auth.dto';
import { successResponse } from '../../../../../lib/utils/response';
import { checkRateLimit } from '../../../../../lib/utils/rateLimit';
import { AppError } from '../../../../../lib/utils/errorHandler';
import { authRepository } from '../../../../../lib/modules/auth/auth.repository';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`resend:${ip}`, 3, 60000 * 15)) {
    throw new AppError('Too many requests', 429, 'RATE_LIMIT');
  }

  const body = await req.json();
  const parsed = resendVerificationSchema.parse(body);

  const user = await authRepository.findUserByEmail(parsed.email);
  if (user && user.status === 'PENDING_VERIFICATION') {
    await authService.sendVerificationOTP(user.id, user.email);
  }

  // Always return success to prevent email enumeration
  return successResponse(null, 'If the account exists and is unverified, a new OTP has been sent.');
}
