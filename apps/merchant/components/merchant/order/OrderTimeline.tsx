'use client';

import React from 'react';
import {
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  StickyNote,
  Info,
} from 'lucide-react';
import { cn } from '@corecart/shared';
import type { MerchantOrderTimelineEntry } from '@corecart/commerce';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getTimelineIcon(status: string): {
  Icon: React.FC<{ className?: string }>;
  iconStyles: string;
  dotStyles: string;
} {
  switch (status) {
    case 'PENDING_PAYMENT':
      return { Icon: ShoppingCart, iconStyles: 'text-amber-600 dark:text-amber-400', dotStyles: 'bg-amber-500/20 border-amber-500/40' };
    case 'CONFIRMED':
      return { Icon: CreditCard, iconStyles: 'text-blue-600 dark:text-blue-400', dotStyles: 'bg-blue-500/20 border-blue-500/40' };
    case 'PROCESSING':
      return { Icon: RefreshCw, iconStyles: 'text-violet-600 dark:text-violet-400', dotStyles: 'bg-violet-500/20 border-violet-500/40' };
    case 'PACKED':
      return { Icon: Package, iconStyles: 'text-cyan-600 dark:text-cyan-400', dotStyles: 'bg-cyan-500/20 border-cyan-500/40' };
    case 'SHIPPED':
      return { Icon: Truck, iconStyles: 'text-indigo-600 dark:text-indigo-400', dotStyles: 'bg-indigo-500/20 border-indigo-500/40' };
    case 'DELIVERED':
      return { Icon: CheckCircle2, iconStyles: 'text-emerald-600 dark:text-emerald-400', dotStyles: 'bg-emerald-500/20 border-emerald-500/40' };
    case 'CANCELLED':
      return { Icon: XCircle, iconStyles: 'text-destructive', dotStyles: 'bg-destructive/10 border-destructive/30' };
    case 'RETURNED':
      return { Icon: RotateCcw, iconStyles: 'text-orange-600 dark:text-orange-400', dotStyles: 'bg-orange-500/20 border-orange-500/40' };
    case 'REFUNDED':
      return { Icon: RefreshCw, iconStyles: 'text-slate-600 dark:text-slate-400', dotStyles: 'bg-slate-500/20 border-slate-500/40' };
    case 'NOTE':
      return { Icon: StickyNote, iconStyles: 'text-muted-foreground', dotStyles: 'bg-muted/60 border-border/60' };
    default:
      return { Icon: Info, iconStyles: 'text-muted-foreground', dotStyles: 'bg-muted/60 border-border/60' };
  }
}

interface OrderTimelineProps {
  timeline: MerchantOrderTimelineEntry[];
}

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <h3 className="text-sm font-bold text-foreground">Order Timeline</h3>

      {timeline.length === 0 ? (
        <p className="text-xs text-muted-foreground">No events recorded yet.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-border/60" />

          <div className="space-y-0">
            {timeline.map((entry, index) => {
              const { Icon, iconStyles, dotStyles } = getTimelineIcon(entry.status);
              return (
                <div key={entry.id} className={cn('relative flex gap-4', index < timeline.length - 1 ? 'pb-5' : '')}>
                  {/* Icon dot */}
                  <div className={cn('relative z-10 size-8 rounded-2xl border flex items-center justify-center shrink-0', dotStyles)}>
                    <Icon className={cn('size-3.5', iconStyles)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-bold text-foreground leading-tight">
                        {entry.status.replace(/_/g, ' ')}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                    {entry.message && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{entry.message}</p>
                    )}
                    {entry.createdBy && entry.createdBy !== 'SYSTEM' && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        by {entry.createdBy}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
