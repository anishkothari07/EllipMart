import { AppError } from '@corecart/shared';

export const couponService = {
  async validateAndApply(code: string, subtotal: number, userId: string) {
    const internxyBaseUrl = process.env.INTERNYX_BASE_URL;
    const internxyApiKey = process.env.INTERNYX_API_KEY;
    
    if (!internxyBaseUrl || !internxyApiKey) {
      console.warn('[COUPON] INTERNYX_BASE_URL or INTERNYX_API_KEY not set. Falling back to mock ₹500 discount.');
      const mockDiscount = Math.min(500, subtotal);
      return {
        couponId: 'mock-internyx-id',
        code,
        discountType: 'FIXED',
        discountValue: mockDiscount,
        discountAmount: mockDiscount
      };
    }

    try {
      // Ping Internyx to validate code
      const response = await fetch(`${internxyBaseUrl}/api/wallet/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': internxyApiKey,
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new AppError('Could not connect to Internyx server', 500);
      }

      const result = await response.json();
      
      if (!result.valid) {
        throw new AppError(result.message || 'Invalid or expired code', 400);
      }

      const discountValue = Number(result.valueInRupees);
      const discountAmount = Math.min(discountValue, subtotal); // Cannot discount more than subtotal

      return {
        couponId: `internyx-${code}`,
        code,
        discountType: 'FIXED',
        discountValue,
        discountAmount
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Failed to verify code with Internyx', 500);
    }
  }
};

