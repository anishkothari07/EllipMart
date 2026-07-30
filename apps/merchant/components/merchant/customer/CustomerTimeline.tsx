'use client';

import React from 'react';
import { UserPlus, ShoppingCart, MapPin, Key, Info, ShieldAlert, BadgeInfo } from 'lucide-react';
import { cn } from '@corecart/shared';
import type { CustomerActivity } from '@corecart/commerce';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'ACCOUNT_CREATED':
      return { Icon: UserPlus, styles: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    case 'ORDER_PLACED':
      return { Icon: ShoppingCart, styles: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' };
    case 'ADDRESS_UPDATED':
      return { Icon: MapPin, styles: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' };
    case 'LOGIN':
      return { Icon: Key, styles: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
    case 'ACCOUNT_UPDATED':
      return { Icon: ShieldAlert, styles: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' };
    default:
      return { Icon: Info, styles: 'text-muted-foreground bg-muted border-border' };
  }
}

interface CustomerTimelineProps {
  activities: CustomerActivity[];
}

export function CustomerTimeline({ activities }: CustomerTimelineProps) {
  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <h3 className="text-sm font-bold text-foreground">Activity Timeline</h3>

      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent activity on record.</p>
      ) : (
        <div className="relative">
          {/* Vertical timeline connector */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-border/60" />

          <div className="space-y-0">
            {activities.map((act, index) => {
              const { Icon, styles } = getActivityIcon(act.type);
              return (
                <div key={act.id} className={cn('relative flex gap-4', index < activities.length - 1 ? 'pb-5' : '')}>
                  {/* Circle dot icon */}
                  <div className={cn('relative z-10 size-8 rounded-2xl border flex items-center justify-center shrink-0', styles)}>
                    <Icon className="size-3.5" />
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0 pt-1 text-left">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-bold text-foreground leading-tight">
                        {act.type.replace(/_/g, ' ')}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{act.message}</p>
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
