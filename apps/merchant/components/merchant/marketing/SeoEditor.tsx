'use client';

import React, { useState } from 'react';
import { Globe, Settings, Image as ImageIcon, Save, Check } from 'lucide-react';
import type { SeoSettingsConfig, SeoMeta } from '@corecart/commerce';
import { MediaLibrary } from './MediaLibrary';

interface SeoEditorProps {
  seo: SeoSettingsConfig;
  onChange: (updated: SeoSettingsConfig) => void;
}

export function SeoEditor({ seo, onChange }: SeoEditorProps) {
  const [activeTab, setActiveTab] = useState<'HOMEPAGE' | 'COLLECTION' | 'CATEGORY' | 'PRODUCT'>('HOMEPAGE');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const getActiveMeta = (): SeoMeta => {
    switch (activeTab) {
      case 'HOMEPAGE':
        return seo.homepage;
      case 'COLLECTION':
        return seo.collectionDefaults;
      case 'CATEGORY':
        return seo.categoryDefaults;
      case 'PRODUCT':
        return seo.productDefaults;
    }
  };

  const updateMeta = (key: keyof SeoMeta, value: string) => {
    const activeMeta = getActiveMeta();
    const updatedMeta = { ...activeMeta, [key]: value };

    let updatedConfig: SeoSettingsConfig;
    switch (activeTab) {
      case 'HOMEPAGE':
        updatedConfig = { ...seo, homepage: updatedMeta };
        break;
      case 'COLLECTION':
        updatedConfig = { ...seo, collectionDefaults: updatedMeta };
        break;
      case 'CATEGORY':
        updatedConfig = { ...seo, categoryDefaults: updatedMeta };
        break;
      case 'PRODUCT':
        updatedConfig = { ...seo, productDefaults: updatedMeta };
        break;
    }
    onChange(updatedConfig);
  };

  const activeMeta = getActiveMeta();

  return (
    <div className="p-5 border border-border/80 bg-card rounded-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
        <div className="size-7 rounded-xl bg-muted/50 flex items-center justify-center">
          <Globe className="size-3.5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Global SEO Defaults</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 pb-1.5 gap-3 text-[10px] font-bold text-muted-foreground">
        {[
          { key: 'HOMEPAGE', label: 'Homepage Meta' },
          { key: 'COLLECTION', label: 'Collection Defaults' },
          { key: 'CATEGORY', label: 'Category Defaults' },
          { key: 'PRODUCT', label: 'Product Defaults' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-1 border-b-2 hover:text-foreground transition-colors ${
              activeTab === t.key ? 'border-foreground text-foreground' : 'border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor Form */}
      <div className="space-y-4 text-left">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Meta Title</label>
            <input
              type="text"
              required
              placeholder="e.g. EllipMart Store | Buy Electronics Online"
              value={activeMeta.title}
              onChange={(e) => updateMeta('title', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Canonical URL</label>
            <input
              type="text"
              placeholder="e.g. https://ellipmart.com"
              value={activeMeta.canonical}
              onChange={(e) => updateMeta('canonical', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground">Meta Description</label>
          <textarea
            required
            placeholder="Write a clear meta description for search engines..."
            value={activeMeta.description}
            onChange={(e) => updateMeta('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Keywords (comma-separated)</label>
            <input
              type="text"
              placeholder="ecommerce, store, online shopping"
              value={activeMeta.keywords}
              onChange={(e) => updateMeta('keywords', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Robots directives</label>
            <input
              type="text"
              placeholder="index, follow"
              value={activeMeta.robots}
              onChange={(e) => updateMeta('robots', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
            />
          </div>
        </div>

        {/* OG Image */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground">Open Graph Image (Social Sharing)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste social sharing image URL or select from library"
              value={activeMeta.ogImage}
              onChange={(e) => updateMeta('ogImage', e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
            />
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="px-3 border border-border hover:bg-background rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <ImageIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Dialog */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl">
            <MediaLibrary
              isPicker
              onSelect={(url) => {
                updateMeta('ogImage', url);
                setShowMediaPicker(false);
              }}
              onClose={() => setShowMediaPicker(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
