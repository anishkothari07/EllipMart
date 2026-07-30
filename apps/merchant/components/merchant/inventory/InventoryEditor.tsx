'use client';

import React, { useState, useEffect } from 'react';
import { InventoryHistory } from './InventoryHistory';
import { MerchantInventoryClient } from '@/lib/services/merchant-inventory-client';
import { X, ShieldAlert, Settings2, Sliders } from 'lucide-react';

interface InventoryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  variant: any; // Passed selected variant info
  onRefresh: () => Promise<void>;
}

export function InventoryEditor({ isOpen, onClose, variant, onRefresh }: InventoryEditorProps) {
  const [adjustType, setAdjustType] = useState<'INCREASE' | 'DECREASE' | 'SET'>('SET');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState<'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'OTHER'>('ADJUSTMENT');
  const [notes, setNotes] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!variant) return;
    setLoadingHistory(true);
    try {
      const data = await MerchantInventoryClient.getHistory(variant.variantId);
      setHistoryList(data);
    } catch (e) {
      console.error('Failed to load history list:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (variant && isOpen) {
      setQuantity(0);
      setAdjustType('SET');
      setReason('ADJUSTMENT');
      setNotes('');
      setLowStockThreshold(variant.lowStockThreshold || 5);
      loadHistory();
    }
  }, [variant, isOpen]);

  if (!isOpen || !variant) return null;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await MerchantInventoryClient.adjustInventory(variant.variantId, {
        adjustType,
        quantity,
        reason,
        notes,
        lowStockThreshold,
      });
      await loadHistory();
      await onRefresh();
      // Reset values
      setQuantity(0);
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to adjust variant stock totals.');
    } finally {
      setSaving(false);
    }
  };

  const adjustTypes = [
    { value: 'SET', label: 'Set quantity' },
    { value: 'INCREASE', label: 'Increase (+)' },
    { value: 'DECREASE', label: 'Decrease (-)' },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Side Panel Overlay */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-card border-l border-border flex flex-col shadow-float select-none animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-foreground font-serif">Manage Inventory</h3>
            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate max-w-sm">
              {variant.productName} &bull; {variant.variantName}
            </span>
          </div>
          <button onClick={onClose} className="size-7 rounded-lg hover:bg-muted/50 flex items-center justify-center">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-[11px] font-semibold flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Stock indicators */}
          <div className="grid gap-4 grid-cols-2 bg-muted/10 p-4 border border-border/60 rounded-2xl">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Stock</span>
              <span className="text-xl font-bold text-foreground font-mono mt-1">{variant.quantityAvailable} Qty</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reserved Stock</span>
              <span className="text-xl font-bold text-foreground font-mono mt-1">{variant.quantityReserved} Qty</span>
            </div>
          </div>

          {/* Adjustment inputs */}
          <form onSubmit={handleAdjust} className="space-y-5 border-b border-border/60 pb-8">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sliders className="size-3.5" /> Adjustment Parameters
            </h4>

            {/* Type tabs */}
            <div className="flex gap-1.5 p-1 bg-muted/20 border border-border/60 rounded-xl">
              {adjustTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setAdjustType(t.value as any);
                    setQuantity(0);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    adjustType === t.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 grid-cols-2">
              {/* Quantity value */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="0"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="h-10 px-3.5 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold outline-none focus:border-foreground/30 transition-colors"
                />
              </div>

              {/* Reason code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="h-10 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="ADJUSTMENT">Adjustment (correction)</option>
                  <option value="PURCHASE">Purchase (restock)</option>
                  <option value="RETURN">Return (restock)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Safety Alert Threshold */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Settings2 className="size-3.5 text-muted-foreground" /> Low Stock Threshold
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="h-10 px-3.5 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold outline-none focus:border-foreground/30 transition-colors"
                />
              </div>

              {/* Adjustment notes */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Received matte variant restock pack"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-border bg-muted/20 text-xs font-medium outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving && <div className="size-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />}
              Save Adjustment
            </button>
          </form>

          {/* Render history audit timeline */}
          <InventoryHistory history={historyList} loading={loadingHistory} />
        </div>
      </div>
    </>
  );
}
