'use client';

import React from 'react';
import { formatPrice } from '@corecart/shared';
import type { MerchantOrderDetail } from '@corecart/commerce';

interface OrderSummaryProps {
  order: MerchantOrderDetail;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const rows = [
    { label: 'Subtotal', value: order.subTotal, muted: false },
    order.discountTotal > 0
      ? { label: `Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, value: -order.discountTotal, muted: false, negative: true }
      : null,
    order.shippingTotal > 0
      ? { label: 'Shipping', value: order.shippingTotal, muted: false }
      : null,
    order.taxTotal > 0
      ? { label: 'Tax (GST)', value: order.taxTotal, muted: false }
      : null,
  ].filter(Boolean) as { label: string; value: number; muted: boolean; negative?: boolean }[];

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-3">
      <h3 className="text-sm font-bold text-foreground">Order Summary</h3>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className={`text-xs font-semibold ${row.negative ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
              {row.negative ? '−' : ''}{formatPrice(Math.abs(row.value), 'INR')}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">Grand Total</span>
        <span className="text-base font-bold text-foreground">{formatPrice(order.grandTotal, 'INR')}</span>
      </div>

      {order.payment && (
        <div className="pt-2 text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Paid via {order.payment.paymentMethodCode.replace(/_/g, ' ')}</span>
          <span>{order.payment.provider}</span>
        </div>
      )}
    </div>
  );
}
