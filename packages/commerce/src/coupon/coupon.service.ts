import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';

export const couponService = {
  async validateAndApply(code: string, subtotal: number, userId: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: { rules: { include: { conditions: true } } }
    });

    if (!coupon) throw new AppError('Invalid coupon code', 400);
    if (!coupon.isActive) throw new AppError('Coupon is no longer active', 400);
    if (coupon.validFrom && new Date() < coupon.validFrom) throw new AppError('Coupon not yet valid', 400);
    if (coupon.validUntil && new Date() > coupon.validUntil) throw new AppError('Coupon expired', 400);
    
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw new AppError(`Minimum order amount of ${coupon.minOrderAmount} required`, 400);
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    if (coupon.usagePerCustomer) {
      const userUsage = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId }
      });
      if (userUsage >= coupon.usagePerCustomer) {
        throw new AppError('You have reached the maximum usage for this coupon', 400);
      }
    }

    // Evaluates advanced rules if any (stubbed out, currently handles base discountType)
    // The robust domain model (CouponRule -> CouponCondition) is in place for future extensions
    // like Buy 2 Get 1, specific categories, etc.

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * Number(coupon.discountValue)) / 100;
    } else if (coupon.discountType === 'FIXED') {
      discount = Number(coupon.discountValue);
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      // Free shipping usually zeros out shipping cost, doesn't discount subtotal
      discount = 0;
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount: Math.min(discount, subtotal) // Cannot discount more than subtotal
    };
  }
};
