export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { loyaltyService } from '@corecart/commerce';
import { getAuthUser } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

/** GET /api/v1/loyalty — current points balance + lifetime stats */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const balance = await loyaltyService.getBalance(user.id);
    return successResponse(balance);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.statusCode ?? 500 }
    );
  }
}
