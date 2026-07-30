'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, Plus, Minus, Search, Settings, Menu, MoveUp, MoveDown, Trash2 } from 'lucide-react';
import type { FeaturedProductSection } from '@corecart/commerce';
import { MerchantMarketingClient } from '@/lib/services/merchant-marketing-client';

interface ProductPickerProps {
  sections: FeaturedProductSection[];
  onChange: (updated: FeaturedProductSection[]) => void;
}

export function ProductPicker({ sections, onChange }: ProductPickerProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal selector state
  const [activeSectionName, setActiveSectionName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const pickerData = await MerchantMarketingClient.getPickersData();
        setProducts(pickerData.products || []);
      } catch (err) {
        console.error('Failed to load products for picker:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSelect = (sectionName: string, productId: string) => {
    const section = sections.find((s) => s.sectionName === sectionName);
    if (!section) return;

    let updatedIds;
    if (section.productIds.includes(productId)) {
      updatedIds = section.productIds.filter((id) => id !== productId);
    } else {
      updatedIds = [...section.productIds, productId];
    }

    const updatedSections = sections.map((s) =>
      s.sectionName === sectionName ? { ...s, productIds: updatedIds } : s
    );
    onChange(updatedSections);
  };

  const moveOrder = (sectionName: string, index: number, direction: 'up' | 'down') => {
    const section = sections.find((s) => s.sectionName === sectionName);
    if (!section) return;

    const updatedIds = [...section.productIds];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updatedIds.length) return;

    // Swap
    const temp = updatedIds[index];
    updatedIds[index] = updatedIds[targetIdx];
    updatedIds[targetIdx] = temp;

    const updatedSections = sections.map((s) =>
      s.sectionName === sectionName ? { ...s, productIds: updatedIds } : s
    );
    onChange(updatedSections);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <div className="size-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
          <span>Loading catalog products...</span>
        </div>
      )}

      {!loading &&
        sections.map((sec) => {
          const isSelectorActive = activeSectionName === sec.sectionName;

          return (
            <div key={sec.sectionName} className="p-5 border border-border/80 bg-card rounded-3xl space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{sec.sectionName} ({sec.productIds.length})</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveSectionName(isSelectorActive ? null : sec.sectionName);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-muted/50 text-xs font-bold rounded-xl transition-colors"
                >
                  <Plus className="size-3.5" />
                  Pin Products
                </button>
              </div>

              {/* Selector Overlay */}
              {isSelectorActive && (
                <div className="p-4 border border-border bg-muted/10 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-150 text-left">
                  <h4 className="text-xs font-bold text-foreground">Select Products to Feature</h4>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search products by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-4 py-1.5 text-xs border border-border/80 bg-background rounded-xl outline-none"
                    />
                  </div>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 max-h-48 overflow-y-auto">
                    {filteredProducts.map((p) => {
                      const isChecked = sec.productIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleSelect(sec.sectionName, p.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                            isChecked
                              ? 'bg-foreground/5 border-foreground text-foreground'
                              : 'bg-background border-border hover:bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {isChecked && <Check className="size-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setActiveSectionName(null)}
                      className="px-3.5 py-1 text-[10px] font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Pinned Products List */}
              <div className="space-y-1.5">
                {sec.productIds.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-2xl">
                    No products pinned in this section. Click "Pin Products" to select.
                  </p>
                ) : (
                  sec.productIds.map((pid, idx) => {
                    const prod = products.find((p) => p.id === pid);
                    return (
                      <div
                        key={pid}
                        className="p-3 border border-border/60 bg-muted/20 rounded-xl flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 text-left">
                          <Menu className="size-3.5 text-muted-foreground shrink-0 cursor-grab" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{prod?.name || 'Loading...'}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">slug: /{prod?.slug || '...'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => moveOrder(sec.sectionName, idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveOrder(sec.sectionName, idx, 'down')}
                            disabled={idx === sec.productIds.length - 1}
                            className="p-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            ▼
                          </button>

                          <button
                            onClick={() => toggleSelect(sec.sectionName, pid)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted/50"
                            title="Unpin"
                          >
                            <Minus className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
