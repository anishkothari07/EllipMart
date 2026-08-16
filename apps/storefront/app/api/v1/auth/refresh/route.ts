import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';

export async function POST(req: NextRequest) {
  // Extract refresh token from cookie or body
  let refreshToken = req.cookies.get('ellipmart_customer_refresh')?.value;
  
  if (!refreshToken) {
    try {
      const body = await req.json();
      refreshToken = body.refreshToken;
    } catch (e) {
      // Body might be empty
    }
  }

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: 'Refresh token missing', error: { code: 'MISSING_TOKEN' } },
      { status: 401 }
    );
  }

  try {
    const result = await authService.refresh({ refreshToken });
    return successResponse(result, 'Token refreshed successfully');
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Invalid refresh token', error: { code: error.code || 'INVALID_TOKEN' } },
      { status: 401 }
    );
  }
}
