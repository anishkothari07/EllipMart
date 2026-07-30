'use client';

import React from 'react';
import { format } from 'date-fns';
import { ClipboardList, ArrowRight, User } from 'lucide-react';

interface HistoryItem {
  id: string;
  createdAt: string;
  quantity: number;
  type: string;
  source: string;
  notes: string;
  prevQty: number;
  newQty: number;
}

interface InventoryHistoryProps {
  history: HistoryItem[];
  loading: boolean;
}

export function InventoryHistory({ history, loading }: InventoryHistoryProps) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center gap-2">
        <div className="size-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Loading history logs...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground">
        No adjustment history logs found for this variant.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        <ClipboardList className="size-3.5" /> Adjustment History
      </h4>

      <div className="border border-border/60 rounded-2xl overflow-hidden bg-muted/10 divide-y divide-border/60">
        {history.map((item) => {
          const isAdd = item.quantity > 0;
          return (
            <div key={item.id} className="p-4 flex gap-4 items-start hover:bg-muted/20 transition-colors">
              <div className={`size-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs ${
                isAdd ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
              }`}>
                {isAdd ? '+' : ''}
                {item.quantity}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-foreground">
                    Stock adjusted via <strong className="uppercase">{item.type}</strong>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono font-medium">
                    {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                
                {/* Notes and source */}
                {item.notes && <p className="text-xs text-muted-foreground italic leading-relaxed">&ldquo;{item.notes}&rdquo;</p>}
                
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold mt-1">
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> Source: {item.source}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    {item.prevQty} <ArrowRight className="size-2.5" /> {item.newQty} Qty
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
