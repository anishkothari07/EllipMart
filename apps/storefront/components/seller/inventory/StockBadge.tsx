'use client';

import React from 'react';

interface StockBadgeProps {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER' | 'DISCONTINUED' | string;
}

export function StockBadge({ status }: StockBadgeProps) {
  let styles = 'bg-muted text-foreground';
  let label = status.replace('_', ' ');

  if (status === 'IN_STOCK') {
    styles = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    label = 'In Stock';
  } else if (status === 'LOW_STOCK') {
    styles = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    label = 'Low Stock';
  } else if (status === 'OUT_OF_STOCK') {
    styles = 'bg-destructive/10 text-destructive border-destructive/20';
    label = 'Out of Stock';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider leading-none select-none ${styles}`}>
      {label}
    </span>
  );
}
