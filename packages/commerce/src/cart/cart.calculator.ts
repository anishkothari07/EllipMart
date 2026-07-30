import { TaxCalculator } from '../tax/tax.service';
import { ShippingCalculator } from '../shipping/shipping.service';

export interface CartItemInput {
  unitPrice: number;
  quantity: number;
}

export interface CartCalculationInput {
  items: CartItemInput[];
  taxRate?: number; 
  shippingRateObj?: any;
  discountAmount?: number;
}

export class CartCalculator {
  static calculate(input: CartCalculationInput) {
    const { items, taxRate = 0, shippingRateObj = null, discountAmount = 0 } = input;

    let subTotal = 0;
    for (const item of items) {
      subTotal += item.unitPrice * item.quantity;
    }

    // Ensure we don't discount more than the subtotal
    const discountTotal = Math.min(discountAmount, subTotal);
    const discountedSubtotal = subTotal - discountTotal;

    // Tax calculation on discounted subtotal
    const taxTotal = TaxCalculator.calculate(discountedSubtotal, taxRate);

    // Shipping calculation
    let shippingTotal = 0;
    if (shippingRateObj) {
      const estimatedShipping = ShippingCalculator.calculate(discountedSubtotal, shippingRateObj);
      // If estimatedShipping is null, it means the rate isn't applicable (e.g. min order not met)
      shippingTotal = estimatedShipping !== null ? estimatedShipping : 0;
    }

    const grandTotal = discountedSubtotal + taxTotal + shippingTotal;

    return {
      subTotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      grandTotal
    };
  }
}
