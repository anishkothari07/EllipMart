'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ProductVariantsProps {
  formData: any;
  onChange: (fields: any) => void;
}

interface VariantOption {
  name: string; // e.g. Color, Size
  values: string[]; // e.g. ['Red', 'Blue']
}

export function ProductVariants({ formData, onChange }: ProductVariantsProps) {
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [hasVariants, setHasVariants] = useState(false);

  // Initialize options state from existing variants if editing
  useEffect(() => {
    if (formData.variants && formData.variants.length > 0 && options.length === 0) {
      // Approximate options from variant names
      // e.g. "Matte Black / S" -> Option 1: Color [Matte Black], Option 2: Size [S]
      // For this sprint we can default to color/size templates or parse existing names.
      setHasVariants(true);
    }
  }, [formData.variants]);

  const handleAddOption = () => {
    setOptions([...options, { name: '', values: [] }]);
    setHasVariants(true);
  };

  const handleRemoveOption = (index: number) => {
    const updated = options.filter((_, idx) => idx !== index);
    setOptions(updated);
    if (updated.length === 0) {
      setHasVariants(false);
      onChange({ variants: [] });
    }
  };

  const handleOptionNameChange = (index: number, name: string) => {
    const updated = [...options];
    updated[index].name = name;
    setOptions(updated);
  };

  const handleOptionValuesChange = (index: number, valuesStr: string) => {
    const updated = [...options];
    updated[index].values = valuesStr
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    setOptions(updated);
  };

  // Compile cartesian combinations whenever options change
  useEffect(() => {
    if (options.length === 0 || options.every((o) => o.values.length === 0 || !o.name)) {
      return;
    }

    // Cartesian product function
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (a, b) => a.flatMap((d) => b.map((e) => [...d, e])),
        [[]]
      );
    };

    const activeOptions = options.filter((o) => o.name && o.values.length > 0);
    if (activeOptions.length === 0) return;

    const valuesArrays = activeOptions.map((o) => o.values);
    const combinations = cartesian(valuesArrays);

    const baseSku = (formData.sku || formData.slug || 'PROD').toUpperCase();

    // Map combinations to variants list
    const compiledVariants = combinations.map((combo, idx) => {
      const variantName = combo.join(' / ');
      const skuSuffix = combo.map((c) => c.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')).join('-');
      const defaultSelling = formData.price?.sellingPrice || 0;
      const defaultMrp = formData.price?.mrp || defaultSelling;

      // Try to find if this variant combination already existed in formData.variants to preserve SKU/Quantity
      const existing = formData.variants?.find((v: any) => v.name === variantName);

      return {
        id: existing?.id || undefined,
        name: variantName,
        sku: existing?.sku || `${baseSku}-${skuSuffix || idx}`,
        barcode: existing?.barcode || '',
        mrp: existing?.mrp || defaultMrp,
        sellingPrice: existing?.sellingPrice || defaultSelling,
        costPrice: existing?.costPrice || formData.price?.costPrice || 0,
        quantity: existing?.quantity || 0,
      };
    });

    onChange({ variants: compiledVariants });
  }, [options, formData.sku, formData.slug, formData.price?.sellingPrice]);

  const handleVariantRowChange = (index: number, field: string, val: any) => {
    const updated = [...(formData.variants || [])];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange({ variants: updated });
  };

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-foreground">Product Variants</h3>
        {!hasVariants && (
          <button
            type="button"
            onClick={handleAddOption}
            className="px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="size-3.5" /> Enable Options
          </button>
        )}
      </div>

      {hasVariants && (
        <div className="space-y-6">
          {/* Options compiler area */}
          <div className="space-y-4">
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-4 items-end bg-muted/20 p-4 rounded-2xl border border-border/60">
                {/* Option Name */}
                <div className="flex-1 max-w-xs flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Option Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Size, Color, Material"
                    value={opt.name}
                    onChange={(e) => handleOptionNameChange(idx, e.target.value)}
                    className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>

                {/* Option Values comma-separated list */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Values (Comma Separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S, M, L or Red, Blue"
                    value={opt.values.join(', ')}
                    onChange={(e) => handleOptionValuesChange(idx, e.target.value)}
                    className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>

                {/* Trash button */}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="size-10 rounded-xl border border-border bg-card hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center text-muted-foreground transition-colors shrink-0"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {options.length < 3 && (
              <button
                type="button"
                onClick={() => setOptions([...options, { name: '', values: [] }])}
                className="px-3.5 py-2 rounded-xl border border-border/80 text-xs font-semibold hover:bg-muted/50 transition-colors flex items-center gap-1"
              >
                <Plus className="size-3.5" /> Add Another Option
              </button>
            )}
          </div>

          {/* Variants matrix table */}
          {formData.variants && formData.variants.length > 0 && (
            <div className="border border-border/60 rounded-2xl overflow-hidden bg-muted/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/60">
                    <th className="p-3 font-semibold text-muted-foreground">Variant name</th>
                    <th className="p-3 font-semibold text-muted-foreground">SKU</th>
                    <th className="p-3 font-semibold text-muted-foreground">Price</th>
                    <th className="p-3 font-semibold text-muted-foreground">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {formData.variants.map((v: any, index: number) => (
                    <tr key={index}>
                      <td className="p-3 font-bold text-foreground">{v.name}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => handleVariantRowChange(index, 'sku', e.target.value)}
                          className="h-8 px-2 w-full max-w-[140px] rounded-lg border border-border bg-card font-mono text-[10px]"
                        />
                      </td>
                      <td className="p-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">₹</span>
                          <input
                            type="number"
                            required
                            min={0}
                            value={v.sellingPrice}
                            onChange={(e) => handleVariantRowChange(index, 'sellingPrice', Number(e.target.value))}
                            className="h-8 pl-5 pr-2 w-full max-w-[100px] rounded-lg border border-border bg-card text-[11px]"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          min={0}
                          value={v.quantity}
                          onChange={(e) => handleVariantRowChange(index, 'quantity', Number(e.target.value))}
                          className="h-8 px-2 w-full max-w-[80px] rounded-lg border border-border bg-card text-[11px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
