import { NextRequest } from 'next/server';
import { authService } from '@corecart/commerce';
import { registerSchema } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';
import { checkRateLimit } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function POST(req: NextRequest) {
  try {
    console.log("---- REGISTRATION TRACE START ----");
    console.log("Request received at POST /api/v1/auth/register");
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`register:${ip}`, 5, 60000 * 60)) {
      throw new AppError('Too many registration attempts. Please try again later.', 429, 'RATE_LIMIT');
    }

    const body = await req.json();
    console.log("Request body parsed:", JSON.stringify(body));
    
    const parsed = registerSchema.parse(body);
    console.log("Validation passed");

    const uaString = req.headers.get('user-agent') || 'unknown';
    const meta = { ip, userAgent: uaString };

    const result = await authService.register(parsed, meta);

    const response = successResponse(
      { accessToken: result.accessToken, user: result.user },
      'Registration successful',
      201
    );

    response.cookies.set('smartgo_customer_refresh', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    console.log("---- REGISTRATION TRACE END ----");
    return response;
  } catch (error: any) {
    console.error("Registration error caught in route handler:", error);
    
    if (error.name === 'ZodError') {
      console.error("Zod Validation Error:", JSON.stringify(error.errors, null, 2));
      return errorResponse(error.errors[0].message, 'VALIDATION_ERROR', error.errors, 400);
    }
    
    if (error.isOperational) {
      return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    }
    
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
