'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Package, Minus } from 'lucide-react';
import { formatPrice } from '@corecart/shared';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { FulfillmentStatusBadge } from './FulfillmentStatusBadge';
import type { MerchantOrderSummary } from '@corecart/commerce';
import { cn } from '@corecart/shared';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

interface OrderTableProps {
  orders: MerchantOrderSummary[];
  loading: boolean;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
}

export function OrderTable({ orders, loading, selectedIds, onSelectIds }: OrderTableProps) {
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onSelectIds([]);
    } else {
      onSelectIds(orders.map((o) => o.id));
    }
  };

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter((x) => x !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="w-10 py-3 px-3 text-left" />
              {['Order', 'Customer', 'Date', 'Payment', 'Fulfillment', 'Items', 'Total'].map((h) => (
                <th key={h} className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
              <th className="w-10 py-3 px-3" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border/40">
                {Array.from({ length: 9 }).map((_, j) => (
                  <td key={j} className="py-3.5 px-3">
                    <div className="h-4 bg-muted/60 rounded-full animate-pulse" style={{ width: j === 0 ? '16px' : j === 7 ? '16px' : `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
        <div className="size-14 rounded-3xl bg-muted/50 flex items-center justify-center">
          <Package className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">No orders found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {/* Checkbox all */}
            <th className="w-10 py-3 px-3">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="size-4 rounded border-border/80 cursor-pointer accent-foreground"
                />
              </div>
            </th>
            {[
              { key: 'order', label: 'Order' },
              { key: 'customer', label: 'Customer' },
              { key: 'date', label: 'Date' },
              { key: 'payment', label: 'Payment' },
              { key: 'fulfillment', label: 'Fulfillment' },
              { key: 'items', label: 'Items' },
              { key: 'total', label: 'Total' },
            ].map((col) => (
              <th
                key={col.key}
                className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            <th className="w-10 py-3 px-3" />
          </tr>
        </thead>

        <tbody className="divide-y divide-border/40">
          {orders.map((order) => {
            const isSelected = selectedIds.includes(order.id);
            return (
              <tr
                key={order.id}
                className={cn(
                  'group hover:bg-muted/30 transition-colors duration-100',
                  isSelected && 'bg-muted/20',
                )}
              >
                {/* Checkbox */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(order.id)}
                      className="size-4 rounded border-border/80 cursor-pointer accent-foreground"
                    />
                  </div>
                </td>

                {/* Order number */}
                <td className="py-3.5 px-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-mono text-xs font-bold text-foreground hover:text-accent transition-colors"
                  >
                    #{order.orderNumber}
                  </Link>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{order.customerName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{order.customerEmail}</p>
                  </div>
                </td>

                {/* Date */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                </td>

                {/* Payment */}
                <td className="py-3.5 px-3">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>

                {/* Fulfillment */}
                <td className="py-3.5 px-3">
                  <FulfillmentStatusBadge status={order.status} />
                </td>

                {/* Items */}
                <td className="py-3.5 px-3">
                  <span className="text-xs font-semibold text-foreground">{order.itemCount}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">item{order.itemCount !== 1 ? 's' : ''}</span>
                </td>

                {/* Total */}
                <td className="py-3.5 px-3">
                  <span className="text-xs font-bold text-foreground">
                    {formatPrice(order.grandTotal, 'INR')}
                  </span>
                </td>

                {/* Link */}
                <td className="py-3.5 px-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="size-7 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all duration-150"
                  >
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
