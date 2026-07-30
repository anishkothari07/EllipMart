'use client';

import React from 'react';
import { CircleDot } from 'lucide-react';
import { cn } from '@corecart/shared';

interface ProductPublishingProps {
  formData: any;
  onChange: (fields: any) => void;
}

export function ProductPublishing({ formData, onChange }: ProductPublishingProps) {
  const statuses = [
    { value: 'ACTIVE', label: 'Active', description: 'Product is live and visible on storefront' },
    { value: 'DRAFT', label: 'Draft', description: 'Product is saved but hidden from customer listings' },
    { value: 'ARCHIVED', label: 'Archived', description: 'Product is deleted/hidden for sales logs preservation' },
  ];

  const visibilities = [
    { value: 'PUBLIC', label: 'Public storefront', description: 'Visible in home catalogs and search results' },
    { value: 'HIDDEN', label: 'Hidden from catalog', description: 'Accessible only via direct URL sharing' },
  ];

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <h3 className="font-serif text-lg font-bold text-foreground">Publishing Status</h3>
      
      <div className="space-y-6">
        {/* Status choices */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Status</label>
          <div className="grid gap-3 grid-cols-1">
            {statuses.map((item) => (
              <label
                key={item.value}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer flex gap-3 items-start select-none transition-colors",
                  formData.status === item.value
                    ? "border-foreground/30 bg-muted/20"
                    : "border-border/80 hover:bg-muted/10"
                )}
              >
                <input
                  type="radio"
                  name="product-status"
                  value={item.value}
                  checked={formData.status === item.value}
                  onChange={() => onChange({ status: item.value })}
                  className="mt-1 size-4 accent-foreground"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{item.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Visibility choices */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Visibility</label>
          <div className="grid gap-3 grid-cols-1">
            {visibilities.map((item) => (
              <label
                key={item.value}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer flex gap-3 items-start select-none transition-colors",
                  formData.visibility === item.value
                    ? "border-foreground/30 bg-muted/20"
                    : "border-border/80 hover:bg-muted/10"
                )}
              >
                <input
                  type="radio"
                  name="product-visibility"
                  value={item.value}
                  checked={formData.visibility === item.value}
                  onChange={() => onChange({ visibility: item.value })}
                  className="mt-1 size-4 accent-foreground"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{item.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
