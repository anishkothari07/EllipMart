export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@corecart/database';
import { walletService } from '@corecart/commerce';

/**
 * POST /api/v1/wallet/topup/webhook
 *
 * Razorpay webhook — fires after payment is captured.
 * This is the ONLY place that actually credits the wallet.
 * It is idempotent: double-delivery of the same webhook is safe.
 *
 * Razorpay sends: X-Razorpay-Signature header
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    // ── 1. Verify signature ───────────────────────────────────────────
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[WalletWebhook] Invalid signature');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // ── 2. Parse payload ──────────────────────────────────────────────
    const payload = JSON.parse(rawBody);
    const event = payload?.event;

    // We only care about successful captures
    if (event !== 'payment.captured') {
      return NextResponse.json({ success: true, message: `Ignored event: ${event}` });
    }

    const payment = payload?.payload?.payment?.entity;
    if (!payment) {
      return NextResponse.json({ success: false, error: 'Missing payment entity' }, { status: 400 });
    }

    const { id: razorpayPaymentId, amount: amountInPaise, notes } = payment;
    const userId: string = notes?.userId;

    if (!userId || notes?.purpose !== 'wallet_topup') {
      // Not a wallet top-up event — ignore
      return NextResponse.json({ success: true, message: 'Not a wallet top-up event' });
    }

    // ── 3. Verify user exists ─────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      console.error(`[WalletWebhook] User not found: ${userId}`);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 });
    }

    // ── 4. Credit wallet (idempotent) ─────────────────────────────────
    const amountInRupees = amountInPaise / 100;
    const tx = await walletService.topUp(userId, amountInRupees, razorpayPaymentId);

    console.log(`[WalletWebhook] Wallet credited: userId=${userId}, amount=₹${amountInRupees}, paymentId=${razorpayPaymentId}, txId=${tx.id}`);

    return NextResponse.json({ success: true, transactionId: tx.id });
  } catch (error: any) {
    console.error('[WalletWebhook] Error:', error);
    // Always return 200 to Razorpay so it doesn't retry excessively
    // But log the error for monitoring
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
