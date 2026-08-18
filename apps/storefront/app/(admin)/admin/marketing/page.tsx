import React from 'react';
import { Megaphone, Tag, Percent, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: 'Coupons & Discounts',
    description: 'Create and manage promotional coupon codes and flash sale discounts.',
    icon: Percent,
    color: 'bg-orange-500/10 text-orange-600',
    status: 'coming_soon',
  },
  {
    title: 'Banner Ads',
    description: 'Manage homepage banners and promotional media placements.',
    icon: Megaphone,
    color: 'bg-blue-500/10 text-blue-600',
    status: 'coming_soon',
  },
  {
    title: 'Loyalty & Rewards',
    description: 'Configure loyalty points, tiers, and reward rules for customers.',
    icon: Gift,
    color: 'bg-violet-500/10 text-violet-600',
    status: 'coming_soon',
  },
  {
    title: 'Tags & Labels',
    description: 'Create product tags and labels for marketing campaigns.',
    icon: Tag,
    color: 'bg-emerald-500/10 text-emerald-600',
    status: 'coming_soon',
  },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage promotions, discounts, and marketing campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className="p-6 rounded-3xl border border-border/80 bg-card space-y-4 opacity-70"
            >
              <div className="flex items-start gap-4">
                <div className={`size-10 rounded-2xl flex items-center justify-center ${mod.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{mod.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
