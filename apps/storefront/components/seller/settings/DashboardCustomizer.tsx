'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, LayoutGrid, Check, Settings, Save } from 'lucide-react';

interface DashboardCustomizerProps {
  onSave?: (pref: any) => void;
}

export function DashboardCustomizer({ onSave }: DashboardCustomizerProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Default dashboard layout sections
  const [cards, setCards] = useState([
    { id: 'sales_metrics', name: 'Lifetime Total Sales Card', visible: true },
    { id: 'orders_count', name: 'Total Orders Volume Card', visible: true },
    { id: 'aov_metrics', name: 'Average Order Value (AOV) Card', visible: true },
    { id: 'new_customers', name: 'Customer Registrations Card', visible: true },
    { id: 'recent_orders_table', name: 'Recent Orders Table List', visible: true },
    { id: 'top_products_table', name: 'Top Products & Inventory Table', visible: true },
    { id: 'active_marketing_banners', name: 'Active Banners & Slides Tracker', visible: true },
  ]);

  const toggleVisibility = (id: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)));
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const updated = [...cards];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setCards(updated);
  };

  const handleSave = () => {
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onSave?.(cards);
    }, 1000);
  };

  return (
    <div className="p-5 border border-border/80 bg-card rounded-3xl space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Dashboard Layout Preferences</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : success ? 'Preferences Saved!' : 'Save Layout'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Customize your merchant administration dashboard view by toggling widget visibility or shifting layout priorities.
      </p>

      <div className="space-y-2.5">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`p-3.5 border border-border/60 bg-muted/20 rounded-2xl flex items-center justify-between gap-4 transition-opacity ${
              !card.visible && 'opacity-55'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <span>{index + 1}.</span>
              <span>{card.name}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleVisibility(card.id)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
                title={card.visible ? 'Hide Widget' : 'Show Widget'}
              >
                {card.visible ? <Eye className="size-4 text-emerald-500" /> : <EyeOff className="size-4" />}
              </button>

              <button
                onClick={() => moveOrder(index, 'up')}
                disabled={index === 0}
                className="p-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                ▲
              </button>
              <button
                onClick={() => moveOrder(index, 'down')}
                disabled={index === cards.length - 1}
                className="p-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
