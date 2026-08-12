import { NextResponse } from 'next/server';
import { walletService } from '@corecart/commerce';
import { loyaltyService } from '@corecart/commerce';

// Vercel Cron or standard scheduled ping hits this endpoint
export async function GET(request: Request) {
  // Check standard CRON auth header (e.g. standard Vercel or custom token)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const walletCount = await walletService.releaseExpiredHolds();
    const loyaltyCount = await loyaltyService.releaseExpiredHolds();

    return NextResponse.json({
      success: true,
      data: {
        walletHoldsReleased: walletCount,
        loyaltyHoldsReleased: loyaltyCount
      }
    });
  } catch (error: any) {
    console.error('[CRON] Release holds failed:', error.message);
    return NextResponse.json(
      { success: false, message: 'Failed to release expired holds' },
      { status: 500 }
    );
  }
}
