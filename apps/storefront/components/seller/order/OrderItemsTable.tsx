'use client';

import React from 'react';
import { formatPrice } from '@corecart/shared';
import type { MerchantOrderItem } from '@corecart/commerce';
import { Package } from 'lucide-react';

interface OrderItemsTableProps {
  items: MerchantOrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card">
      <h3 className="text-sm font-bold text-foreground mb-4">
        Items ({items.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60">
              {['Product', 'SKU', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'].map((h) => (
                <th
                  key={h}
                  className="pb-2.5 px-2 first:pl-0 last:pr-0 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.map((item) => (
              <tr key={item.id} className="group">
                {/* Product */}
                <td className="py-3 px-2 pl-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                      <Package className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground leading-tight truncate max-w-[180px]">{item.productName}</p>
                      {item.brandName && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.brandName}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="py-3 px-2">
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">{item.sku}</span>
                </td>

                {/* Qty */}
                <td className="py-3 px-2">
                  <span className="font-bold text-foreground">{item.quantity}</span>
                </td>

                {/* Unit Price */}
                <td className="py-3 px-2 whitespace-nowrap">
                  <span className="text-foreground">{formatPrice(item.unitPrice, 'INR')}</span>
                </td>

                {/* Discount */}
                <td className="py-3 px-2 whitespace-nowrap">
                  {item.discount > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">−{formatPrice(item.discount, 'INR')}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Tax */}
                <td className="py-3 px-2 whitespace-nowrap">
                  {item.tax > 0 ? (
                    <span className="text-foreground">{formatPrice(item.tax, 'INR')}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Total */}
                <td className="py-3 px-2 pr-0 whitespace-nowrap">
                  <span className="font-bold text-foreground">{formatPrice(item.totalPrice, 'INR')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
