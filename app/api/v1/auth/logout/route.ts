import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../../../../../lib/modules/auth/auth.service';
import { successResponse } from '../../../../../lib/utils/response';
import { verifyRefreshToken } from '../../../../../lib/utils/jwt';

export async function POST(req: NextRequest) {
  let refreshToken = req.cookies.get('refreshToken')?.value;
  
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
  response.cookies.delete('refreshToken');
  
  return response;
}
