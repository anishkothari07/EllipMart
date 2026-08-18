'use client';

import React, { useState } from 'react';
import { StockBadge } from './StockBadge';
import { InventoryEditor } from './InventoryEditor';
import { Layers } from 'lucide-react';

interface InventoryTableProps {
  inventory: any[];
  onRefresh: () => Promise<void>;
}

export function InventoryTable({ inventory, onRefresh }: InventoryTableProps) {
  const [selectedInv, setSelectedInv] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="border border-border/60 rounded-3xl overflow-hidden bg-card shadow-sm">
        {inventory.length === 0 ? (
          <div className="p-16 border border-border/60 rounded-3xl text-center space-y-4 bg-card">
            <div className="mx-auto size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
              <Layers className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">No Inventory Items Found</h4>
              <p className="text-xs text-muted-foreground">
                First verify that variants have been created under your products listings.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60">
                  <th className="p-4 font-semibold text-muted-foreground">SKU</th>
                  <th className="p-4 font-semibold text-muted-foreground">Product</th>
                  <th className="p-4 font-semibold text-muted-foreground">Variant Option</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Available Stock</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Reserved Stock</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Safety Alert Limit</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedInv(item)}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono font-bold text-foreground text-[10px]">{item.sku}</td>
                    <td className="p-4 font-bold text-foreground truncate max-w-xs">{item.productName}</td>
                    <td className="p-4 text-muted-foreground font-semibold">{item.variantName}</td>
                    <td className="p-4 text-center font-bold text-foreground font-mono">{item.quantityAvailable}</td>
                    <td className="p-4 text-center text-muted-foreground font-semibold font-mono">{item.quantityReserved}</td>
                    <td className="p-4 text-center text-muted-foreground font-semibold font-mono">{item.lowStockThreshold}</td>
                    <td className="p-4">
                      <StockBadge status={item.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInv(item);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted/50 transition-colors text-[10px] font-bold text-muted-foreground"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor drawer slider */}
      <InventoryEditor
        isOpen={!!selectedInv}
        onClose={() => setSelectedInv(null)}
        variant={selectedInv}
        onRefresh={onRefresh}
      />
    </div>
  );
}
