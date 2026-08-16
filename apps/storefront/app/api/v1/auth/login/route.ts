import { NextRequest } from 'next/server';
import { authService } from '@corecart/commerce';
import { loginSchema } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';
import { checkRateLimit } from '@corecart/shared';
import { AppError } from '@corecart/shared';

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate a user and create a session
 *     description: Accepts email and password, verifies credentials, and returns a JWT access token and user profile. Sets a secure HTTP-only refresh token cookie.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 *       500:
 *         description: Internal server error
 */
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

    response.cookies.set('ellipmart_customer_refresh', result.refreshToken, {
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
      const issues = error.issues || error.errors;
      return errorResponse(issues[0].message, 'VALIDATION_ERROR', issues, 400);
    }
    
    if (error.isOperational) {
      return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    }
    
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
