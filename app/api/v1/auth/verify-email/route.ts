import { NextRequest } from 'next/server';
import { authService } from '../../../../../lib/modules/auth/auth.service';
import { verifyEmailSchema } from '../../../../../lib/modules/auth/auth.dto';
import { successResponse } from '../../../../../lib/utils/response';
import { checkRateLimit } from '../../../../../lib/utils/rateLimit';
import { AppError } from '../../../../../lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`verify:${ip}`, 10, 60000 * 15)) {
    throw new AppError('Too many verification attempts', 429, 'RATE_LIMIT');
  }

  const body = await req.json();
  const parsed = verifyEmailSchema.parse(body);

  const result = await authService.verifyEmail(parsed);

  return successResponse(result, 'Email verified successfully. You can now login.');
}
