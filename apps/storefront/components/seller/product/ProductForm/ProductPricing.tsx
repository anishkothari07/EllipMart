'use client';

import React from 'react';

interface ProductPricingProps {
  formData: any;
  onChange: (fields: any) => void;
}

export function ProductPricing({ formData, onChange }: ProductPricingProps) {
  const price = formData.price || { mrp: 0, sellingPrice: 0, costPrice: 0 };

  const handlePriceChange = (field: string, val: number) => {
    onChange({
      price: {
        ...price,
        [field]: val,
      },
    });
  };

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <h3 className="font-serif text-lg font-bold text-foreground">Pricing</h3>
      
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
        {/* Selling Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (INR)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
            <input
              type="number"
              required
              min={0}
              placeholder="0.00"
              value={price.sellingPrice || ''}
              onChange={(e) => handlePriceChange('sellingPrice', Number(e.target.value))}
              className="h-11 pl-8 pr-4 w-full rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
        </div>

        {/* Compare-At Price (MRP) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Compare-at Price (MRP)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
            <input
              type="number"
              min={0}
              placeholder="0.00"
              value={price.mrp || ''}
              onChange={(e) => handlePriceChange('mrp', Number(e.target.value))}
              className="h-11 pl-8 pr-4 w-full rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
        </div>

        {/* Cost Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cost per Item</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
            <input
              type="number"
              min={0}
              placeholder="0.00"
              value={price.costPrice || ''}
              onChange={(e) => handlePriceChange('costPrice', Number(e.target.value))}
              className="h-11 pl-8 pr-4 w-full rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
          <span className="text-[10px] text-muted-foreground ml-1">Customers won&apos;t see this price</span>
        </div>
      </div>
    </div>
  );
}
