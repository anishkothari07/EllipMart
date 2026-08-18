'use client';

import React from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface LowStockWidgetProps {
  data: {
    lowStockCount: number;
    outOfStockCount: number;
    items: {
      sku: string;
      productName: string;
      variantName: string;
      quantityAvailable: number;
      lowStockThreshold: number;
    }[];
  } | null;
  loading: boolean;
}

export function LowStockWidget({ data, loading }: LowStockWidgetProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-3xl border border-border/80 bg-card flex flex-col justify-center items-center py-12 gap-2">
        <div className="size-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Loading stock alerts...</span>
      </div>
    );
  }

  if (!data) return null;

  const totalAlerts = data.lowStockCount + data.outOfStockCount;

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className={`size-4.5 ${totalAlerts > 0 ? 'text-amber-500 animate-pulse' : 'text-muted-foreground'}`} />
          <h3 className="font-serif text-lg font-bold text-foreground">Stock Alerts</h3>
        </div>
        <Link
          href="/seller/inventory"
          className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-0.5"
        >
          View all <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {/* Highlights summary numbers */}
      <div className="grid gap-3 grid-cols-2">
        <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/10 text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Out of stock</span>
          <p className="text-xl font-bold text-foreground font-serif mt-1">{data.outOfStockCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/10 text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Low stock</span>
          <p className="text-xl font-bold text-foreground font-serif mt-1">{data.lowStockCount}</p>
        </div>
      </div>

      {/* Alerts item listing */}
      {data.items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">All products catalog stock is within safe safety margins.</p>
      ) : (
        <div className="space-y-3">
          {data.items.map((item, idx) => {
            const isOutOfStock = item.quantityAvailable === 0;
            return (
              <div
                key={item.sku + idx}
                className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card hover:bg-muted/10 transition-colors"
              >
                <div className="flex flex-col text-left min-w-0 pr-2">
                  <span className="text-xs font-bold text-foreground truncate">{item.productName}</span>
                  <span className="text-[9px] text-muted-foreground truncate mt-0.5">
                    {item.variantName} &bull; SKU: {item.sku}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 select-none ${
                    isOutOfStock
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isOutOfStock ? 'Out of stock' : `${item.quantityAvailable} left`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
