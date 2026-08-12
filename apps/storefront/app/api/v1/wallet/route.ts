export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@corecart/commerce';
import { getAuthUser } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

/** GET /api/v1/wallet — current balance + last 5 transactions */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [balanceInfo, txData] = await Promise.all([
      walletService.getBalance(user.id),
      walletService.getTransactions(user.id, 1, 5),
    ]);

    return successResponse({
      ...balanceInfo,
      recentTransactions: txData.transactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.statusCode ?? 500 }
    );
  }
}
