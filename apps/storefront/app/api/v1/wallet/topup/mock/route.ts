export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@corecart/commerce';
import { getAuthUser } from '@corecart/commerce';
import { AppError, successResponse } from '@corecart/shared';

/**
 * POST /api/v1/wallet/topup/mock
 * Body: { amount: number }  — in rupees (₹100–₹10,000)
 *
 * DEV / MOCK mode: directly credits the wallet without going through Razorpay.
 * Only active when RAZORPAY_KEY_ID is not set or NODE_ENV is not production.
 */
export async function POST(req: NextRequest) {
  // Block in production with real keys configured
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes('xxxx')
  ) {
    return NextResponse.json({ success: false, error: 'Mock top-up is disabled in production' }, { status: 403 });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) throw new AppError('Unauthorized', 401);

    const { amount } = await req.json();

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'amount is required (in rupees)' }, { status: 400 });
    }
    if (amount < 100) {
      return NextResponse.json({ success: false, error: 'Minimum top-up is ₹100' }, { status: 400 });
    }
    if (amount > 10000) {
      return NextResponse.json({ success: false, error: 'Maximum top-up per transaction is ₹10,000' }, { status: 400 });
    }

    // Validate balance cap
    const balance = await walletService.getBalance(user.id);
    if (balance.balance + amount > 50000) {
      return NextResponse.json(
        { success: false, error: `Top-up would exceed ₹50,000 wallet limit. Current balance: ₹${balance.balance}` },
        { status: 400 },
      );
    }

    // Generate a mock payment ID
    const mockPaymentId = `mock_pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Directly credit the wallet
    const tx = await walletService.topUp(user.id, amount, mockPaymentId);

    return successResponse({
      mocked: true,
      paymentId: mockPaymentId,
      amount,
      newBalance: tx.balance,
      message: `₹${amount} added to wallet (mock mode)`,
    });
  } catch (error: any) {
    if (error.isOperational) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
