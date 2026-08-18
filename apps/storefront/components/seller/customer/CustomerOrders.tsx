'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, Minus } from 'lucide-react';
import { formatPrice } from '@corecart/shared';
import type { CustomerOrder } from '@corecart/commerce';
import { OrderStatusBadge } from '../order/OrderStatusBadge';
import { PaymentStatusBadge } from '../order/PaymentStatusBadge';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface CustomerOrdersProps {
  orders: CustomerOrder[];
}

export function CustomerOrders({ orders }: CustomerOrdersProps) {
  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
        <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <ShoppingBag className="size-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Purchase History ({orders.length})</h3>
      </div>

      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No purchases recorded.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                {['Order #', 'Date', 'Status', 'Payment', 'Total Amount'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 px-2 first:pl-0 last:pr-0 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
                <th className="w-8 pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.map((o) => (
                <tr key={o.id} className="group hover:bg-muted/10 transition-colors">
                  {/* Order ID */}
                  <td className="py-3.5 px-2 pl-0">
                    <Link href={`/seller/orders/${o.id}`} className="font-mono font-bold text-foreground hover:text-accent">
                      #{o.orderNumber}
                    </Link>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-2 text-muted-foreground whitespace-nowrap">
                    {formatDate(o.createdAt)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-2">
                    <OrderStatusBadge status={o.status} />
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-2">
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-2 font-bold text-foreground whitespace-nowrap">
                    {formatPrice(o.grandTotal, 'INR')}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-2 pr-0">
                    <Link
                      href={`/seller/orders/${o.id}`}
                      className="size-6 rounded-lg bg-muted/40 text-muted-foreground opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-muted hover:text-foreground transition-all duration-150"
                    >
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
