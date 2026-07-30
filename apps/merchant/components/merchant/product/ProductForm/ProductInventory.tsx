'use client';

import React from 'react';

interface ProductInventoryProps {
  formData: any;
  onChange: (fields: any) => void;
}

export function ProductInventory({ formData, onChange }: ProductInventoryProps) {
  const inventory = formData.inventory || { quantity: 0, lowStockThreshold: 5 };

  const handleInvChange = (field: string, val: any) => {
    onChange({
      inventory: {
        ...inventory,
        [field]: val,
      },
    });
  };

  const hasVariants = formData.variants && formData.variants.length > 0;

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-foreground">Inventory</h3>
        {hasVariants && (
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Managed via variants
          </span>
        )}
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
        {/* SKU */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SKU (Stock Keeping Unit)</label>
          <input
            type="text"
            disabled={hasVariants}
            placeholder="e.g. WH-PHONES-BLK"
            value={formData.sku || ''}
            onChange={(e) => onChange({ sku: e.target.value })}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Barcode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Barcode (ISBN, UPC, GTIN)</label>
          <input
            type="text"
            disabled={hasVariants}
            placeholder="e.g. 192837465"
            value={formData.barcode || ''}
            onChange={(e) => onChange({ barcode: e.target.value })}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Stock Quantity</label>
          <input
            type="number"
            disabled={hasVariants}
            min={0}
            placeholder="0"
            value={inventory.quantity || 0}
            onChange={(e) => handleInvChange('quantity', Number(e.target.value))}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Low Stock Alert Threshold */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Low Stock Threshold</label>
          <input
            type="number"
            disabled={hasVariants}
            min={0}
            placeholder="5"
            value={inventory.lowStockThreshold || 5}
            onChange={(e) => handleInvChange('lowStockThreshold', Number(e.target.value))}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
