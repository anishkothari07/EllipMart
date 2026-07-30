'use client';

import React, { useState } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import { MerchantCustomerClient } from '@/lib/services/merchant-customer-client';

interface CustomerTagsProps {
  userId: string;
  tags: string[];
  onUpdate: () => void;
}

export function CustomerTags({ userId, tags: initialTags, onUpdate }: CustomerTagsProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRemove = async (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setLoading(true);
    try {
      await MerchantCustomerClient.updateTags(userId, updated);
      setTags(updated);
      onUpdate();
    } catch (err) {
      console.error('Failed to remove tag:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTag.trim();
    if (!cleanTag || tags.includes(cleanTag)) return;

    const updated = [...tags, cleanTag];
    setLoading(true);
    try {
      await MerchantCustomerClient.updateTags(userId, updated);
      setTags(updated);
      setNewTag('');
      onUpdate();
    } catch (err) {
      console.error('Failed to add tag:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <TagIcon className="size-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Customer Tags</h3>
      </div>

      {/* Tag list */}
      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tags assigned.</p>
        ) : (
          tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-foreground/5 text-foreground border border-border"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                disabled={loading}
                className="hover:text-destructive transition-colors shrink-0"
              >
                <X className="size-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add tag form */}
      <form onSubmit={handleAdd} className="relative mt-2">
        <input
          type="text"
          placeholder="New tag name..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          disabled={loading}
          className="w-full pl-3.5 pr-10 py-2.5 text-xs border border-border/80 bg-background rounded-2xl outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 transition-all duration-150"
        />
        <button
          type="submit"
          disabled={loading || !newTag.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-opacity"
        >
          <Plus className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
