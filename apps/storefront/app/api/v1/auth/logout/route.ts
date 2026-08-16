import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { verifyRefreshToken } from '@corecart/shared';

export async function POST(req: NextRequest) {
  let refreshToken = req.cookies.get('ellipmart_customer_refresh')?.value;
  
  if (!refreshToken) {
    try {
      const body = await req.json();
      refreshToken = body.refreshToken;
    } catch (e) {
      // Body might be empty
    }
  }

  if (refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload.sessionId) {
        await authService.logout(payload.sessionId);
      }
    } catch (e) {
      // Ignore token errors on logout
    }
  }

  const response = successResponse(null, 'Logged out successfully');
  response.cookies.delete('ellipmart_customer_refresh');
  
  return response;
}
