/**
 * CheckoutLoyaltyService — orchestrates loyalty points hold lifecycle during checkout.
 *
 * Called by checkout.service.ts when the customer elects to redeem loyalty points.
 * Never directly deducts points; always goes through the hold pattern.
 */
import { loyaltyService } from '../loyalty/loyalty.service';

export const checkoutLoyaltyService = {
  /**
   * Reserve loyalty points for a checkout session.
   * Hold expires in 30 minutes (matching CheckoutSession TTL).
   *
   * @returns The created hold (including monetaryValue = points × ₹1)
   */
  async applyLoyalty(userId: string, points: number, sessionId: string) {
    if (!points || points <= 0) return null;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    return loyaltyService.createHold(userId, points, sessionId, expiresAt);
  },

  /**
   * Finalize the loyalty hold after payment succeeds.
   * Converts PENDING hold → FINALIZED + creates REDEEM transaction.
   */
  async finalizeLoyalty(sessionId: string, orderId: string) {
    try {
      return await loyaltyService.finalizeHold(sessionId, orderId);
    } catch (err: any) {
      // If no hold exists (loyalty wasn't used), silently skip
      if (err.message?.includes('not found')) return null;
      throw err;
    }
  },

  /**
   * Release the loyalty hold if payment fails or session expires.
   */
  async releaseLoyalty(sessionId: string) {
    return loyaltyService.releaseHold(sessionId);
  },
};
