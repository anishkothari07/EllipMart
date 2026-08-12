/**
 * CheckoutWalletService — orchestrates wallet hold lifecycle during checkout.
 *
 * Called by checkout.service.ts when the customer elects to use wallet balance.
 * Never directly debits the wallet; always goes through the hold pattern.
 */
import { walletService } from '../wallet/wallet.service';

export const checkoutWalletService = {
  /**
   * Reserve wallet balance for a checkout session.
   * Hold expires in 30 minutes (matching CheckoutSession TTL).
   */
  async applyWallet(userId: string, amount: number, sessionId: string) {
    if (!amount || amount <= 0) return null;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    return walletService.createHold(userId, amount, sessionId, expiresAt);
  },

  /**
   * Finalize the wallet hold after payment succeeds.
   * Converts PENDING hold → FINALIZED + creates PURCHASE transaction.
   */
  async finalizeWallet(sessionId: string, orderId: string) {
    try {
      return await walletService.finalizeHold(sessionId, orderId);
    } catch (err: any) {
      // If no hold exists (wallet wasn't used), silently skip
      if (err.message?.includes('not found')) return null;
      throw err;
    }
  },

  /**
   * Release the wallet hold if payment fails or session expires.
   */
  async releaseWallet(sessionId: string) {
    return walletService.releaseHold(sessionId);
  },
};
