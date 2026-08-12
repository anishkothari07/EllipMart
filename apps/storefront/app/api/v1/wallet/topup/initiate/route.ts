export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { walletService } from '@corecart/commerce';
import { getAuthUser } from '@corecart/commerce';
import { AppError, successResponse } from '@corecart/shared';

/**
 * POST /api/v1/wallet/topup/initiate
 * Body: { amount: number }  — in rupees (₹100–₹10,000)
 *
 * Creates a Razorpay order for wallet top-up.
 * The frontend then opens Razorpay checkout with this order.
 * Do NOT credit the wallet here — that happens only after webhook verification.
 */
export async function POST(req: NextRequest) {
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

    // Validate the resulting balance won't exceed the cap
    const balance = await walletService.getBalance(user.id);
    if (balance.balance + amount > 50000) {
      return NextResponse.json(
        { success: false, error: `Top-up would exceed ₹50,000 wallet limit. Current balance: ₹${balance.balance}` },
        { status: 400 },
      );
    }

    const amountInPaise = Math.round(amount * 100);

    // Instantiate inside handler — avoids build-time env var requirement
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID ?? '',
      key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `wallet_topup_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        purpose: 'wallet_topup',
      },
    });

    return successResponse(
      {
        razorpayOrderId: order.id,
        amount,
        amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      'Razorpay order created',
    );
  } catch (error: any) {
    console.error('Wallet top-up initiate failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
