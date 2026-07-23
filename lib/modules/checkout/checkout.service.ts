import { cartService } from '../cart/cart.service';
import { inventoryService } from '../inventory/inventory.service';
import { CartCalculator } from '../cart/cart.calculator';
import { couponService } from '../coupon/coupon.service';
import { shippingService } from '../shipping/shipping.service';
import { paymentService } from '../payment/payment.service';
import { orderService } from '../order/order.service';
import { AppError } from '@/lib/utils/errorHandler';
import { prisma } from '@/lib/prisma/client';

export class CheckoutValidationPipeline {
  static async validate(userId: string, input: any) {
    // 1. Validate Cart
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);

    // 2. Validate Inventory
    const stockChecks = await Promise.all(cart.items.map(async item => {
       const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId }, include: { inventory: true } });
       const available = variant?.inventory ? (variant.inventory.quantityAvailable - variant.inventory.quantityReserved) : 0;
       if (item.quantity > available) throw new AppError(`Insufficient stock for ${variant?.name}`, 400);
       return { item, variant };
    }));

    // 3. Validate Address
    let address = null;
    if (input.addressId) {
      address = await prisma.address.findUnique({ where: { id: input.addressId } });
      if (!address || address.userId !== userId) throw new AppError('Invalid shipping address', 400);
    } else if (input.address) {
      address = input.address; // Use raw address payload
    } else {
      throw new AppError('Shipping address is required', 400);
    }

    // 4. Calculate Subtotal first for Coupon & Shipping
    let rawSubtotal = 0;
    cart.items.forEach(item => { rawSubtotal += Number(item.variant.pricing?.sellingPrice || 0) * item.quantity });

    // 5. Validate Coupon
    let validCoupon: any = null;
    if (input.couponCode) {
      validCoupon = await couponService.validateAndApply(input.couponCode, rawSubtotal, userId);
    }

    // 6. Validate Shipping
    let shippingRate: any = { id: 'mock', zone: { provider: { name: 'Standard' } }, estDays: '3-5 days' }; 
    if (input.shippingRateId) {
      shippingRate = await shippingService.getRateById(input.shippingRateId);
      if (!shippingRate) throw new AppError('Invalid shipping rate selected', 400);
    }

    // 7. Calculate Totals via CartCalculator
    const calcInput = {
      items: cart.items.map(item => ({
        unitPrice: Number(item.variant.pricing?.sellingPrice || 0),
        quantity: item.quantity
      })),
      taxRate: 18,
      shippingRateObj: shippingRate,
      discountAmount: validCoupon ? validCoupon.discountAmount : 0
    };

    const totals = CartCalculator.calculate(calcInput);

    const isIndia = address && (address.country === 'IN' || address.country === 'India');
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIndia) {
      const warehouseState = 'KA'; // Karnataka
      const shippingState = (address.state || '').toUpperCase();
      const isIntraState = shippingState.includes('KA') || shippingState.includes('KARNATAKA');
      
      if (isIntraState) {
        cgst = totals.taxTotal / 2;
        sgst = totals.taxTotal / 2;
      } else {
        igst = totals.taxTotal;
      }
    }

    const addressWithGst = {
      ...address,
      isBusiness: input.isBusiness || false,
      gstin: input.gstin || "",
      companyName: input.companyName || "",
      cgst,
      sgst,
      igst,
    };

    return { cart, address: addressWithGst, validCoupon, shippingRate, totals };
  }
}

export const checkoutService = {
  async processCheckout(userId: string, input: any) {
    // Pipeline
    const { cart, address, validCoupon, shippingRate, totals } = await CheckoutValidationPipeline.validate(userId, input);

    const paymentMethodCode = input.paymentMethodCode || input.paymentProvider || 'UPI';

    // 1. Create CheckoutSession
    const session = await paymentService.createCheckoutSession({
      userId,
      cartId: cart.id,
      shippingAddress: JSON.stringify(address),
      billingAddress: JSON.stringify(address),
      couponCode: validCoupon?.code,
      shippingMethod: shippingRate.zone?.provider?.name || 'Standard',
      subTotal: totals.subTotal,
      taxTotal: totals.taxTotal,
      shippingTotal: totals.shippingTotal,
      discountTotal: totals.discountTotal,
      grandTotal: totals.grandTotal,
      paymentMethodCode
    });

    // 2. Initialize Order Payment
    const paymentResult = await paymentService.initializeOrderPayment(session.id);
    const order = await prisma.order.findUnique({ where: { id: paymentResult.orderId } });

    // 3. Fire analytics
    this.triggerAnalyticsHooks(cart.items);

    return {
      orderNumber: order?.orderNumber || `ORD-${Date.now()}`,
      orderId: paymentResult.orderId,
      paymentId: paymentResult.paymentId,
      providerOrderId: paymentResult.providerOrderId,
      clientSecret: paymentResult.clientSecret,
      paymentMethodCode,
      session
    };
  },

  async triggerAnalyticsHooks(items: any[]) {
    items.forEach(async (item) => {
      try {
        await prisma.product.update({
          where: { id: item.variant.productId },
          data: { salesCount: { increment: item.quantity } }
        });
      } catch(e) {}
    });
  }
};
