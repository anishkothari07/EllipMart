export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { loyaltyService } from '@corecart/commerce';
import { getAuthUser } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

/** GET /api/v1/loyalty/transactions?page=1&limit=20 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')));

    const result = await loyaltyService.getTransactions(user.id, page, limit);
    return successResponse(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.statusCode ?? 500 }
    );
  }
}
