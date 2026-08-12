import { prisma } from '@corecart/database';
import { LoyaltyTxType, HoldStatus } from '@prisma/client';
import { AppError } from '@corecart/shared';

// ─── Constants ────────────────────────────────────────────────────────────────
/** ₹ spent per point earned. floor(orderEligible / EARN_RATE) = points */
const EARN_RATE = 100;
/** ₹ value redeemed per point */
const POINT_VALUE = 1.0;

export class LoyaltyService {

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Get or lazily create a loyalty account for the user. */
  async getOrCreate(userId: string) {
    return prisma.loyaltyAccount.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  /**
   * Returns:
   *  - points: committed redeemable balance
   *  - pendingHolds: points reserved in active checkout sessions
   *  - availablePoints: points - pendingHolds
   *  - monetaryValue: availablePoints × POINT_VALUE (in ₹)
   */
  async getBalance(userId: string) {
    const account = await this.getOrCreate(userId);

    const holdsAgg = await prisma.loyaltyHold.aggregate({
      where: { loyaltyAccountId: account.id, status: HoldStatus.PENDING },
      _sum: { points: true },
    });

    const pendingHolds = holdsAgg._sum.points ?? 0;
    const available = Math.max(0, account.points - pendingHolds);

    return {
      points: account.points,
      pendingHolds,
      availablePoints: available,
      monetaryValue: available * POINT_VALUE,
      lifetimeEarned: account.lifetimeEarned,
      lifetimeRedeemed: account.lifetimeRedeemed,
    };
  }

  /** Convert a points count to ₹ value. */
  pointsToRupees(points: number) {
    return points * POINT_VALUE;
  }

  // ── Hold Lifecycle ─────────────────────────────────────────────────────────

  /**
   * Reserve `points` for a checkout session.
   * Throws if insufficient available points.
   */
  async createHold(
    userId: string,
    points: number,
    sessionId: string,
    expiresAt: Date,
  ) {
    if (points <= 0) throw new AppError('Points to hold must be positive', 400);

    return prisma.$transaction(async (tx) => {
      // Lock account row
      const accounts = await tx.$queryRaw<{ id: string; points: number }[]>`
        SELECT id, points FROM LoyaltyAccount WHERE userId = ${userId} LIMIT 1 FOR UPDATE
      `;

      if (!accounts.length) throw new AppError('Loyalty account not found', 404);
      const acct = accounts[0];

      const holdsAgg = await tx.loyaltyHold.aggregate({
        where: { loyaltyAccountId: acct.id, status: HoldStatus.PENDING },
        _sum: { points: true },
      });

      const pendingHolds = holdsAgg._sum.points ?? 0;
      const available = acct.points - pendingHolds;

      if (available < points) {
        throw new AppError(
          `Insufficient loyalty points. Available: ${available}, Requested: ${points}`,
          400,
        );
      }

      const monetaryValue = this.pointsToRupees(points);

      return tx.loyaltyHold.create({
        data: {
          loyaltyAccountId: acct.id,
          sessionId,
          points,
          monetaryValue,
          expiresAt,
          status: HoldStatus.PENDING,
        },
      });
    });
  }

  /** Release a loyalty hold (payment failed or session expired). */
  async releaseHold(sessionId: string) {
    await prisma.loyaltyHold.updateMany({
      where: { sessionId, status: HoldStatus.PENDING },
      data: { status: HoldStatus.RELEASED },
    });
  }

  /**
   * Finalize a loyalty hold after successful payment.
   * Atomically: marks hold FINALIZED, deducts points, creates REDEEM transaction.
   */
  async finalizeHold(sessionId: string, orderId: string) {
    return prisma.$transaction(async (tx) => {
      const hold = await tx.loyaltyHold.findUnique({ where: { sessionId } });
      if (!hold) throw new AppError('Loyalty hold not found', 404);
      if (hold.status !== HoldStatus.PENDING) {
        throw new AppError(`Loyalty hold is already ${hold.status}`, 400);
      }

      // Lock account row
      const accounts = await tx.$queryRaw<{ id: string; points: number; lifetimeRedeemed: number }[]>`
        SELECT id, points, lifetimeRedeemed FROM LoyaltyAccount WHERE id = ${hold.loyaltyAccountId} LIMIT 1 FOR UPDATE
      `;
      const acct = accounts[0];
      const newPoints = acct.points - hold.points;

      if (newPoints < 0) throw new AppError('Points balance cannot go negative', 400);

      // Mark hold finalized
      await tx.loyaltyHold.update({
        where: { id: hold.id },
        data: { status: HoldStatus.FINALIZED, orderId },
      });

      // Update account
      await tx.loyaltyAccount.update({
        where: { id: hold.loyaltyAccountId },
        data: {
          points: newPoints,
          lifetimeRedeemed: acct.lifetimeRedeemed + hold.points,
        },
      });

      // Create immutable REDEEM transaction
      return tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: hold.loyaltyAccountId,
          type: LoyaltyTxType.REDEEM,
          points: -hold.points,
          pointsBalance: newPoints,
          monetaryValue: Number(hold.monetaryValue),
          description: `Points redeemed for order`,
          orderId,
          holdId: hold.id,
        },
      });
    });
  }

  // ── Earn ───────────────────────────────────────────────────────────────────

  /**
   * Credit points earned on order delivery.
   *
   * Rules:
   * - Earn rate: floor(eligibleMerchandiseValue / 100) points
   * - Eligible base = merchandise value after item-level discounts only
   *   (excludes shipping, tax, wallet deduction, redeemed points)
   * - Idempotent: if EARN transaction already exists for this orderId, returns it unchanged
   * - Should only be called when order status changes to DELIVERED
   *
   * @param userId          The customer's user ID
   * @param eligibleAmount  Merchandise total (excluding shipping/tax/wallet/points)
   * @param orderId         The completed order ID
   */
  async earnPoints(userId: string, eligibleAmount: number, orderId: string) {
    const points = Math.floor(eligibleAmount / EARN_RATE);
    if (points <= 0) return null; // Not enough spend to earn any points

    return prisma.$transaction(async (tx) => {
      const account = await this.getOrCreate(userId);

      // Idempotency: unique constraint on (loyaltyAccountId, orderId, type=EARN)
      const existing = await tx.loyaltyTransaction.findUnique({
        where: {
          unique_loyalty_order_tx: {
            loyaltyAccountId: account.id,
            orderId,
            type: LoyaltyTxType.EARN,
          },
        },
      });
      if (existing) return existing; // Delivery event fired twice — safe no-op

      // Lock and update
      const accounts = await tx.$queryRaw<{ id: string; points: number; lifetimeEarned: number }[]>`
        SELECT id, points, lifetimeEarned FROM LoyaltyAccount WHERE id = ${account.id} LIMIT 1 FOR UPDATE
      `;
      const acct = accounts[0];
      const newPoints = acct.points + points;

      await tx.loyaltyAccount.update({
        where: { id: acct.id },
        data: {
          points: newPoints,
          lifetimeEarned: acct.lifetimeEarned + points,
        },
      });

      return tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: acct.id,
          type: LoyaltyTxType.EARN,
          points,
          pointsBalance: newPoints,
          monetaryValue: this.pointsToRupees(points),
          description: `${points} points earned on delivery`,
          orderId,
        },
      });
    });
  }

  // ── Admin Adjust ───────────────────────────────────────────────────────────

  /**
   * Admin manual add (positive) or deduct (negative) points.
   * Always creates a NEW row — never edits existing transactions.
   */
  async adminAdjust(userId: string, points: number, reason: string, adminUserId?: string) {
    if (points === 0) throw new AppError('Adjustment points cannot be zero', 400);

    return prisma.$transaction(async (tx) => {
      const account = await this.getOrCreate(userId);
      const newPoints = account.points + points;

      if (newPoints < 0) throw new AppError('Adjustment would make points balance negative', 400);

      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: newPoints,
          ...(points > 0 ? { lifetimeEarned: account.lifetimeEarned + points } : {}),
        },
      });

      return tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          type: LoyaltyTxType.ADJUSTMENT,
          points,
          pointsBalance: newPoints,
          monetaryValue: this.pointsToRupees(Math.abs(points)),
          description: reason,
          adminUserId: adminUserId ?? null,
        },
      });
    });
  }

  // ── Welcome Bonus ──────────────────────────────────────────────────────────

  /**
   * Grant one-time Welcome Bonus points (+50 pts) to a new user on registration/first login.
   */
  async grantWelcomeBonus(userId: string, bonusPoints = 50) {
    return prisma.$transaction(async (tx) => {
      const account = await this.getOrCreate(userId);
      if (account.welcomeBonusClaimed) return null; // Already claimed

      const newPoints = account.points + bonusPoints;

      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: newPoints,
          lifetimeEarned: account.lifetimeEarned + bonusPoints,
          welcomeBonusClaimed: true,
        },
      });

      return tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          type: LoyaltyTxType.WELCOME_BONUS,
          points: bonusPoints,
          pointsBalance: newPoints,
          monetaryValue: this.pointsToRupees(bonusPoints),
          description: `Welcome bonus for joining SmartGO (+${bonusPoints} pts)`,
        },
      });
    });
  }

  // ── Referrals ──────────────────────────────────────────────────────────────

  /** Get or generate a user's unique referral code. */
  async getOrCreateReferralCode(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (user?.referralCode) return user.referralCode;

    // Generate unique code like REF-A1B2C3
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `REF-${randomHex}`;

    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });

    return code;
  }

  /**
   * Process referee signup using a referral code.
   * Gives referee 50 pts immediately and creates a PENDING_FIRST_ORDER Referral record.
   */
  async processReferralSignup(refereeUserId: string, referralCode: string) {
    if (!referralCode) return null;

    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.trim().toUpperCase() },
      select: { id: true },
    });

    if (!referrer || referrer.id === refereeUserId) return null;

    // Check if referral record already exists
    const existing = await prisma.referral.findUnique({
      where: { refereeId: refereeUserId },
    });
    if (existing) return null;

    return prisma.$transaction(async (tx) => {
      // Create Referral record
      const referral = await tx.referral.create({
        data: {
          referrerId: referrer.id,
          refereeId: refereeUserId,
          code: referralCode.trim().toUpperCase(),
          status: 'PENDING_FIRST_ORDER',
          referrerPoints: 100,
          refereePoints: 50,
        },
      });

      // Update referee user
      await tx.user.update({
        where: { id: refereeUserId },
        data: { referredByCode: referralCode.trim().toUpperCase() },
      });

      // Credit referee 50 points
      const refereeAccount = await this.getOrCreate(refereeUserId);
      const newPoints = refereeAccount.points + 50;

      await tx.loyaltyAccount.update({
        where: { id: refereeAccount.id },
        data: {
          points: newPoints,
          lifetimeEarned: refereeAccount.lifetimeEarned + 50,
        },
      });

      await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: refereeAccount.id,
          type: LoyaltyTxType.REFERRAL,
          points: 50,
          pointsBalance: newPoints,
          monetaryValue: this.pointsToRupees(50),
          description: `Referral welcome reward (+50 pts)`,
          referralId: referral.id,
        },
      });

      return referral;
    });
  }

  /**
   * Reward referrer when referee's first order is delivered.
   * Triggered on order status change to DELIVERED.
   */
  async processReferralFirstOrder(refereeUserId: string) {
    const referral = await prisma.referral.findUnique({
      where: { refereeId: refereeUserId },
    });

    if (!referral || referral.status !== 'PENDING_FIRST_ORDER') return null;

    return prisma.$transaction(async (tx) => {
      // Mark completed
      await tx.referral.update({
        where: { id: referral.id },
        data: { status: 'COMPLETED' },
      });

      // Credit referrer 100 points
      const referrerAccount = await this.getOrCreate(referral.referrerId);
      const newPoints = referrerAccount.points + referral.referrerPoints;

      await tx.loyaltyAccount.update({
        where: { id: referrerAccount.id },
        data: {
          points: newPoints,
          lifetimeEarned: referrerAccount.lifetimeEarned + referral.referrerPoints,
        },
      });

      return tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: referrerAccount.id,
          type: LoyaltyTxType.REFERRAL,
          points: referral.referrerPoints,
          pointsBalance: newPoints,
          monetaryValue: this.pointsToRupees(referral.referrerPoints),
          description: `Referral bonus: friend completed first order (+${referral.referrerPoints} pts)`,
          referralId: referral.id,
        },
      });
    });
  }

  /** Get referral dashboard stats for a user. */
  async getReferralStats(userId: string) {
    const code = await this.getOrCreateReferralCode(userId);

    const [referrals, totalEarnedTx] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          referee: {
            select: { firstName: true, lastName: true, createdAt: true },
          },
        },
      }),
      prisma.loyaltyTransaction.aggregate({
        where: {
          account: { userId },
          type: LoyaltyTxType.REFERRAL,
          points: { gt: 0 },
        },
        _sum: { points: true },
      }),
    ]);

    return {
      referralCode: code,
      totalReferrals: referrals.length,
      successfulReferrals: referrals.filter((r) => r.status === 'COMPLETED').length,
      totalPointsEarned: totalEarnedTx._sum.points ?? 0,
      referrals: referrals.map((r) => ({
        id: r.id,
        refereeName: `${r.referee.firstName} ${r.referee.lastName}`.trim(),
        status: r.status,
        createdAt: r.createdAt,
      })),
    };
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  async getTransactions(userId: string, page = 1, limit = 20) {
    const account = await this.getOrCreate(userId);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.loyaltyTransaction.findMany({
        where: { loyaltyAccountId: account.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          points: true,
          pointsBalance: true,
          monetaryValue: true,
          description: true,
          orderId: true,
          createdAt: true,
        },
      }),
      prisma.loyaltyTransaction.count({ where: { loyaltyAccountId: account.id } }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Background job helper ─────────────────────────────────────────────────

  /** Release all loyalty holds that have passed their expiry time. */
  async releaseExpiredHolds() {
    const expired = await prisma.loyaltyHold.findMany({
      where: { status: HoldStatus.PENDING, expiresAt: { lt: new Date() } },
      select: { sessionId: true },
    });

    await Promise.all(expired.map((h) => this.releaseHold(h.sessionId)));
    return expired.length;
  }
}

export const loyaltyService = new LoyaltyService();
