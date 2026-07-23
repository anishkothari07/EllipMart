import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../../../../lib/utils/response';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('This endpoint is only available in development mode', 'FORBIDDEN', undefined, 403);
  }

  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return errorResponse('Email parameter is required', 'BAD_REQUEST', undefined, 400);
  }

  const otp = (global as any).__devOtps?.get(email);
  if (!otp) {
    return errorResponse('No OTP found for this email in current session', 'NOT_FOUND', undefined, 404);
  }

  return successResponse({ otp }, 'Latest OTP retrieved successfully');
}
