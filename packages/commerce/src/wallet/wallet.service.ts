import { prisma } from '@corecart/database';
import { WalletTxType, HoldStatus } from '@prisma/client';
import { AppError } from '@corecart/shared';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOPUP_MIN = 100;        // ₹100 minimum top-up
const TOPUP_MAX = 10_000;     // ₹10,000 maximum per transaction
const BALANCE_MAX = 50_000;   // ₹50,000 maximum wallet balance

export class WalletService {

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Get or lazily create a wallet for the user. */
  async getOrCreate(userId: string) {
    return prisma.wallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  /**
   * Returns the balance broken down into:
   *  - balance: the committed ledger balance
   *  - pendingHolds: sum of all PENDING holds
   *  - availableBalance: balance minus pending holds (what the user can actually spend)
   */
  async getBalance(userId: string) {
    const wallet = await this.getOrCreate(userId);

    const holds = await prisma.walletHold.aggregate({
      where: { walletId: wallet.id, status: HoldStatus.PENDING },
      _sum: { amount: true },
    });

    const pendingHolds = Number(holds._sum.amount ?? 0);
    const balance = Number(wallet.balance);

    return {
      balance,
      pendingHolds,
      availableBalance: Math.max(0, balance - pendingHolds),
    };
  }

  // ── Hold Lifecycle ─────────────────────────────────────────────────────────

  /**
   * Reserve `amount` from the wallet for a checkout session.
   * Uses a DB-level transaction + row-level select to prevent race conditions.
   * Throws if the available balance is insufficient.
   */
  async createHold(
    userId: string,
    amount: number,
    sessionId: string,
    expiresAt: Date,
  ) {
    if (amount <= 0) throw new AppError('Hold amount must be positive', 400);

    return prisma.$transaction(async (tx) => {
      // Lock the wallet row for this transaction
      const wallet = await tx.$queryRaw<{ id: string; balance: string }[]>`
        SELECT id, balance FROM Wallet WHERE userId = ${userId} LIMIT 1 FOR UPDATE
      `;

      if (!wallet.length) throw new AppError('Wallet not found', 404);
      const w = wallet[0];

      // Calculate available balance within the same transaction
      const holdsAgg = await tx.walletHold.aggregate({
        where: { walletId: w.id, status: HoldStatus.PENDING },
        _sum: { amount: true },
      });

      const pendingHolds = Number(holdsAgg._sum.amount ?? 0);
      const available = Number(w.balance) - pendingHolds;

      if (available < amount) {
        throw new AppError(
          `Insufficient wallet balance. Available: \u20B9${available.toFixed(2)}, Requested: \u20B9${amount.toFixed(2)}`,
          400,
        );
      }

      return tx.walletHold.create({
        data: {
          walletId: w.id,
          sessionId,
          amount,
          expiresAt,
          status: HoldStatus.PENDING,
        },
      });
    });
  }

  /** Release a hold (payment failed or session expired). */
  async releaseHold(sessionId: string) {
    await prisma.walletHold.updateMany({
      where: { sessionId, status: HoldStatus.PENDING },
      data: { status: HoldStatus.RELEASED },
    });
  }

  /**
   * Finalize a hold after successful payment.
   * Atomically: marks hold FINALIZED, deducts balance, creates PURCHASE transaction.
   */
  async finalizeHold(sessionId: string, orderId: string) {
    return prisma.$transaction(async (tx) => {
      const hold = await tx.walletHold.findUnique({ where: { sessionId } });
      if (!hold) throw new AppError('Wallet hold not found', 404);
      if (hold.status !== HoldStatus.PENDING) {
        throw new AppError(`Hold is already ${hold.status}`, 400);
      }

      // Lock wallet row for atomic debit
      const wallets = await tx.$queryRaw<{ id: string; balance: string }[]>`
        SELECT id, balance FROM Wallet WHERE id = ${hold.walletId} LIMIT 1 FOR UPDATE
      `;
      const w = wallets[0];
      const newBalance = Number(w.balance) - Number(hold.amount);

      if (newBalance < 0) throw new AppError('Wallet balance cannot go negative', 400);

      // Mark hold finalized
      await tx.walletHold.update({
        where: { id: hold.id },
        data: { status: HoldStatus.FINALIZED, orderId },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { id: hold.walletId },
        data: { balance: newBalance },
      });

      // Create immutable PURCHASE transaction
      return tx.walletTransaction.create({
        data: {
          walletId: hold.walletId,
          type: WalletTxType.PURCHASE,
          amount: -Number(hold.amount),
          balance: newBalance,
          description: `Wallet payment for order`,
          orderId,
          holdId: hold.id,
        },
      });
    });
  }

  // ── Top-Up ─────────────────────────────────────────────────────────────────

  /**
   * Credit wallet after Razorpay webhook verifies payment.
   * Idempotent: if a transaction with this paymentId already exists, returns it without double-crediting.
   */
  async topUp(userId: string, amount: number, razorpayPaymentId: string) {
    if (amount < TOPUP_MIN) {
      throw new AppError(`Minimum top-up amount is \u20B9${TOPUP_MIN}`, 400);
    }
    if (amount > TOPUP_MAX) {
      throw new AppError(`Maximum top-up amount per transaction is \u20B9${TOPUP_MAX}`, 400);
    }

    return prisma.$transaction(async (tx) => {
      const wallet = await this.getOrCreate(userId);

      // Idempotency check — unique constraint on (walletId, paymentId)
      const existing = await tx.walletTransaction.findUnique({
        where: { unique_wallet_topup: { walletId: wallet.id, paymentId: razorpayPaymentId } },
      });
      if (existing) return existing; // Webhook fired twice — safe to return existing

      const newBalance = Number(wallet.balance) + amount;
      if (newBalance > BALANCE_MAX) {
        throw new AppError(`Wallet balance cannot exceed \u20B9${BALANCE_MAX}`, 400);
      }

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      // Create TOPUP transaction
      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxType.TOPUP,
          amount,
          balance: newBalance,
          description: 'Wallet top-up via Razorpay',
          paymentId: razorpayPaymentId,
        },
      });
    });
  }

  // ── Refund ─────────────────────────────────────────────────────────────────

  /**
   * Credit back the wallet-funded portion of a cancelled/returned order.
   * Only call this for the wallet-funded amount; Razorpay-funded amount goes back via Razorpay.
   */
  async refund(userId: string, amount: number, orderId: string, description?: string) {
    if (amount <= 0) throw new AppError('Refund amount must be positive', 400);

    return prisma.$transaction(async (tx) => {
      const wallet = await this.getOrCreate(userId);
      const newBalance = Number(wallet.balance) + amount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxType.REFUND,
          amount,
          balance: newBalance,
          description: description ?? `Refund for order`,
          orderId,
        },
      });
    });
  }

  // ── Admin Adjust ───────────────────────────────────────────────────────────

  /**
   * Admin manual credit (positive) or debit (negative).
   * Always creates a NEW row — never edits existing transactions.
   */
  async adminAdjust(userId: string, amount: number, reason: string) {
    if (amount === 0) throw new AppError('Adjustment amount cannot be zero', 400);

    return prisma.$transaction(async (tx) => {
      const wallet = await this.getOrCreate(userId);
      const newBalance = Number(wallet.balance) + amount;

      if (newBalance < 0) throw new AppError('Adjustment would make balance negative', 400);

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxType.ADJUSTMENT,
          amount,
          balance: newBalance,
          description: reason,
        },
      });
    });
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreate(userId);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          balance: true,
          description: true,
          orderId: true,
          paymentId: true,
          createdAt: true,
        },
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Background job helper ─────────────────────────────────────────────────

  /** Release all wallet holds that have passed their expiry time. */
  async releaseExpiredHolds() {
    const expired = await prisma.walletHold.findMany({
      where: { status: HoldStatus.PENDING, expiresAt: { lt: new Date() } },
      select: { sessionId: true },
    });

    await Promise.all(expired.map((h) => this.releaseHold(h.sessionId)));
    return expired.length;
  }
}

export const walletService = new WalletService();
