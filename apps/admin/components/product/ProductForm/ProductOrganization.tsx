'use client';

import React, { useState } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';

interface ProductOrganizationProps {
  formData: any;
  onChange: (fields: any) => void;
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
}

export function ProductOrganization({ formData, onChange, categories, collections }: ProductOrganizationProps) {
  const [tagInput, setTagInput] = useState('');
  const tags = formData.tags || [];
  const selectedCollections = formData.collectionIds || [];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        onChange({ tags: [...tags, val] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    onChange({ tags: tags.filter((_: any, idx: number) => idx !== index) });
  };

  const handleCollectionToggle = (colId: string) => {
    const updated = selectedCollections.includes(colId)
      ? selectedCollections.filter((id: string) => id !== colId)
      : [...selectedCollections, colId];
    onChange({ collectionIds: updated });
  };

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <h3 className="font-serif text-lg font-bold text-foreground">Organization & Tags</h3>
      
      <div className="grid gap-5">
        {/* Category select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
          <select
            required
            value={formData.categoryId || ''}
            onChange={(e) => onChange({ categoryId: e.target.value })}
            className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors cursor-pointer"
          >
            <option value="" disabled>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Collections checklist */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collections</label>
          <div className="border border-border/80 rounded-2xl p-4 bg-muted/10 max-h-40 overflow-y-auto space-y-2">
            {collections.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active collections found</p>
            ) : (
              collections.map((col) => (
                <label key={col.id} className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(col.id)}
                    onChange={() => handleCollectionToggle(col.id)}
                    className="size-4 rounded border-border accent-foreground"
                  />
                  {col.name}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Tags chips list */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags</label>
          <div className="relative">
            <TagIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag and press Enter"
              className="h-11 pl-10 pr-4 w-full rounded-xl border border-border bg-muted/20 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground/30 transition-colors"
            />
          </div>

          {/* Render tag chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t: string, idx: number) => (
                <span
                  key={t + idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-muted text-foreground border border-border select-none"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
