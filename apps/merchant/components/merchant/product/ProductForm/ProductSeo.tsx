'use client';

import React from 'react';

interface ProductSeoProps {
  formData: any;
  onChange: (fields: any) => void;
}

export function ProductSeo({ formData, onChange }: ProductSeoProps) {
  const seo = formData.seo || { title: '', description: '' };

  const handleSeoChange = (field: string, val: string) => {
    onChange({
      seo: {
        ...seo,
        [field]: val,
      },
    });
  };

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <h3 className="font-serif text-lg font-bold text-foreground">Search Engine Optimization</h3>
      
      <div className="grid gap-5">
        {/* SEO Page Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Page Title</label>
          <input
            type="text"
            placeholder={formData.name || 'e.g. Minimalist Wireless Headphones'}
            value={seo.title || ''}
            onChange={(e) => handleSeoChange('title', e.target.value)}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
          />
          <span className="text-[10px] text-muted-foreground ml-1">Defaults to product name if empty</span>
        </div>

        {/* SEO Page Meta Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Meta Description</label>
          <textarea
            rows={3}
            placeholder={formData.shortDescription || 'SEO metadata description snippet...'}
            value={seo.description || ''}
            onChange={(e) => handleSeoChange('description', e.target.value)}
            className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors resize-none"
          />
          <span className="text-[10px] text-muted-foreground ml-1">Defaults to short description if empty</span>
        </div>
      </div>
    </div>
  );
}
