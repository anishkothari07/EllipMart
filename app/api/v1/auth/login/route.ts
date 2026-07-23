import { NextRequest } from 'next/server';
import { authService } from '../../../../../lib/modules/auth/auth.service';
import { loginSchema } from '../../../../../lib/modules/auth/auth.dto';
import { successResponse, errorResponse } from '../../../../../lib/utils/response';
import { checkRateLimit } from '../../../../../lib/utils/rateLimit';
import { AppError } from '../../../../../lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`login:${ip}`, 20, 60000 * 15)) {
      throw new AppError('Too many login attempts. Please try again later.', 429, 'RATE_LIMIT');
    }

    const body = await req.json();
    console.log('[DEBUG] Login request received');
    console.log('[DEBUG] Email:', body.email);
    console.log('[DEBUG] Password length:', body.password?.length);

    const parsed = loginSchema.parse(body);

    const uaString = req.headers.get('user-agent') || 'unknown';
    const meta = { ip, userAgent: uaString };

    const result = await authService.login(parsed, meta);
    console.log('[DEBUG] Login successful, returning response');

    const response = successResponse(
      { accessToken: result.accessToken, user: result.user },
      'Login successful'
    );

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.log('[DEBUG] Error in login route:', error.message);
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 'VALIDATION_ERROR', error.errors, 400);
    }
    
    if (error.isOperational) {
      return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    }
    
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
