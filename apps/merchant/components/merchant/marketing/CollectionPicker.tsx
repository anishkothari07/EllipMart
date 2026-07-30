'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, Check, Plus, Minus, Settings, Menu } from 'lucide-react';
import type { FeaturedCollection } from '@corecart/commerce';
import { MerchantMarketingClient } from '@/lib/services/merchant-marketing-client';

interface CollectionPickerProps {
  selected: FeaturedCollection[];
  onChange: (updated: FeaturedCollection[]) => void;
}

export function CollectionPicker({ selected, onChange }: CollectionPickerProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const pickerData = await MerchantMarketingClient.getPickersData();
        setCollections(pickerData.collections || []);
      } catch (err) {
        console.error('Failed to load collections for picker:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSelect = (id: string) => {
    const isSelected = selected.some((s) => s.collectionId === id);
    if (isSelected) {
      onChange(selected.filter((s) => s.collectionId !== id));
    } else {
      onChange([...selected, { collectionId: id, sortOrder: selected.length + 1, isActive: true }]);
    }
  };

  const toggleActive = (id: string) => {
    onChange(selected.map((s) => (s.collectionId === id ? { ...s, isActive: !s.isActive } : s)));
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const updated = [...selected];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Re-index sortOrder
    const reindexed = updated.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    onChange(reindexed);
  };

  const selectedMap = new Map(selected.map((s) => [s.collectionId, s]));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Featured Home Collections</h3>
        </div>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-muted/50 text-xs font-bold rounded-xl transition-colors"
        >
          <Settings className="size-3.5" />
          Configure Collections
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <div className="size-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
          <span>Loading catalog collections...</span>
        </div>
      )}

      {/* Select List Overlay */}
      {showSelector && !loading && (
        <div className="p-4 border border-border bg-muted/10 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-150 text-left">
          <h4 className="text-xs font-bold text-foreground mb-2">Select Collections to Feature</h4>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 max-h-48 overflow-y-auto">
            {collections.map((c) => {
              const isChecked = selectedMap.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleSelect(c.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    isChecked
                      ? 'bg-foreground/5 border-foreground text-foreground'
                      : 'bg-background border-border hover:bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {isChecked && <Check className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => setShowSelector(false)}
              className="px-3.5 py-1 text-[10px] font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Active Featured List */}
      {!loading && (
        <div className="space-y-2">
          {selected.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-2xl">
              No collections featured on the homepage. Click "Configure" to select.
            </p>
          ) : (
            selected.map((item, idx) => {
              const details = collections.find((c) => c.id === item.collectionId);
              return (
                <div
                  key={item.collectionId}
                  className={`p-3.5 border border-border/80 bg-card rounded-2xl flex items-center justify-between gap-4 ${
                    !item.isActive && 'opacity-65'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <Menu className="size-4 text-muted-foreground shrink-0 cursor-grab" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {details?.name || 'Loading collection name...'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">
                        slug: /{details?.slug || '...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(item.collectionId)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        item.isActive
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                          : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => moveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveOrder(idx, 'down')}
                      disabled={idx === selected.length - 1}
                      className="p-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▼
                    </button>

                    <button
                      onClick={() => toggleSelect(item.collectionId)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted/50"
                      title="Remove"
                    >
                      <Minus className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
