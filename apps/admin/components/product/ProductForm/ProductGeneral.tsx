'use client';

import React from 'react';

interface ProductGeneralProps {
  formData: any;
  onChange: (fields: any) => void;
  brands: { id: string; name: string }[];
}

export function ProductGeneral({ formData, onChange, brands }: ProductGeneralProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Generate URL slug automatically on name changes (if name is dirty)
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-');
    
    onChange({ name, slug });
  };

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <h3 className="font-serif text-lg font-bold text-foreground">General Information</h3>
      
      <div className="grid gap-5">
        {/* Product Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Product Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Minimalist Wireless Headphones"
            value={formData.name || ''}
            onChange={handleNameChange}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
          />
        </div>

        {/* Slug URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL Slug</label>
          <input
            type="text"
            required
            placeholder="e.g. minimalist-wireless-headphones"
            value={formData.slug || ''}
            onChange={(e) => onChange({ slug: e.target.value })}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors font-mono"
          />
        </div>

        {/* Short Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Short Description</label>
          <textarea
            rows={3}
            placeholder="Brief summary displayed in product cards..."
            value={formData.shortDescription || ''}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors resize-none"
          />
        </div>

        {/* Long Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Product Description</label>
          <textarea
            rows={5}
            placeholder="Detailed features, specifications list, materials description..."
            value={formData.longDescription || ''}
            onChange={(e) => onChange({ longDescription: e.target.value })}
            className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors resize-none"
          />
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Brand / Vendor</label>
          <select
            value={formData.brandId || ''}
            onChange={(e) => onChange({ brandId: e.target.value || null })}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors cursor-pointer"
          >
            <option value="">No Brand Selected</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
