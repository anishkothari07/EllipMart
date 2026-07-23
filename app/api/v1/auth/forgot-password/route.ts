import { NextRequest } from 'next/server';
import { authService } from '../../../../../lib/modules/auth/auth.service';
import { forgotPasswordSchema } from '../../../../../lib/modules/auth/auth.dto';
import { successResponse } from '../../../../../lib/utils/response';
import { checkRateLimit } from '../../../../../lib/utils/rateLimit';
import { AppError } from '../../../../../lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`forgotpwd:${ip}`, 5, 60000 * 15)) {
    throw new AppError('Too many requests', 429, 'RATE_LIMIT');
  }

  const body = await req.json();
  const parsed = forgotPasswordSchema.parse(body);

  const result = await authService.forgotPassword(parsed);

  return successResponse(result, 'If the email exists, a reset code has been sent.');
}
