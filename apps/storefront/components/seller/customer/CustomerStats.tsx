'use client';

import React from 'react';
import { CreditCard, ShoppingBag, BarChart3, Calendar } from 'lucide-react';
import { formatPrice } from '@corecart/shared';

interface CustomerStatsProps {
  stats: {
    totalOrders: number;
    totalSpend: number;
    avgOrderValue: number;
    lastPurchaseDate: string | null;
  };
}

export function CustomerStats({ stats }: CustomerStatsProps) {
  const cards = [
    {
      label: 'Total Spend',
      value: formatPrice(stats.totalSpend, 'INR'),
      icon: CreditCard,
      styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      styles: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Average Order Value',
      value: formatPrice(stats.avgOrderValue, 'INR'),
      icon: BarChart3,
      styles: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Last Purchase',
      value: stats.lastPurchaseDate
        ? new Date(stats.lastPurchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Never',
      icon: Calendar,
      styles: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="p-4 rounded-2xl border border-border/80 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{c.label}</span>
              <div className={`size-7 rounded-xl flex items-center justify-center shrink-0 ${c.styles}`}>
                <Icon className="size-3.5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground leading-none">{c.value}</h3>
          </div>
        );
      })}
    </div>
  );
}
