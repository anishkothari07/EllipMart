'use client';

import React, { useEffect, useState } from 'react';
import { MerchantMarketingClient } from '@/lib/services/merchant-marketing-client';
import { HeroManager } from '@/components/merchant/marketing/HeroManager';
import { BannerEditor } from '@/components/merchant/marketing/BannerEditor';
import { CollectionPicker } from '@/components/merchant/marketing/CollectionPicker';
import { ProductPicker } from '@/components/merchant/marketing/ProductPicker';
import { SeoEditor } from '@/components/merchant/marketing/SeoEditor';
import { AnnouncementEditor } from '@/components/merchant/marketing/AnnouncementEditor';
import { RefreshCw, Save, Check, AlertCircle, ChevronRight, LayoutDashboard, Megaphone, Target, Settings, Globe } from 'lucide-react';
import { cn } from '@corecart/shared';
import type { MarketingContent } from '@corecart/commerce';

export default function MerchantMarketingPage() {
  const [content, setContent] = useState<MarketingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'CAROUSEL' | 'PROMOS' | 'PICKERS' | 'ANNOUNCEMENTS' | 'SEO'>('CAROUSEL');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadContent = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const data = await MerchantMarketingClient.getMarketingContent();
      setContent(data);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to load marketing settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    setStatusMsg(null);
    try {
      await MerchantMarketingClient.saveMarketingContent(content);
      setStatusMsg({ type: 'success', text: 'Marketing configurations saved successfully!' });
      // Clear message after 3 seconds
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save marketing configs.' });
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (key: keyof MarketingContent, value: any) => {
    if (!content) return;
    setContent({ ...content, [key]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Operations</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Marketing & Content</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif mt-1">Marketing & Content</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure homepage banners, promotions, pinned products, announcement notifications, and SEO metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={loadContent}
            disabled={loading || saving}
            className="size-9 flex items-center justify-center border border-border/80 hover:bg-muted/50 rounded-2xl transition-colors"
            title="Reload config"
          >
            <RefreshCw className={`size-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving || !content}
            className="px-4 py-2 bg-foreground text-background text-xs font-bold rounded-2xl hover:bg-foreground/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <div className="size-3.5 border-2 border-current border-t-transparent animate-spin rounded-full" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={cn(
            "p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200",
            statusMsg.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/5 border-destructive/10 text-destructive'
          )}
        >
          <span className="font-medium">{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-[10px] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {loading && !content ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Loading marketing configurations...</p>
        </div>
      ) : (
        content && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Sidebar navigation tabs */}
            <div className="p-3 bg-muted/10 border border-border/80 rounded-3xl space-y-1">
              {[
                { key: 'CAROUSEL', label: 'Hero Slideshow', icon: LayoutDashboard },
                { key: 'PROMOS', label: 'Campaign Banners', icon: Megaphone },
                { key: 'PICKERS', label: 'Featured Catalog', icon: Target },
                { key: 'ANNOUNCEMENTS', label: 'Announcement Bar', icon: Settings },
                { key: 'SEO', label: 'SEO Metadata Defaults', icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-left transition-all duration-150",
                      isActive
                        ? "bg-foreground text-background shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active Content view card */}
            <div className="lg:col-span-3 space-y-4">
              {activeTab === 'CAROUSEL' && (
                <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-foreground">Homepage Hero slideshow</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure rotating banners, captions, active times, and target CTA links.
                    </p>
                  </div>
                  <HeroManager
                    banners={content.heroBanners}
                    onChange={(val) => updateSection('heroBanners', val)}
                  />
                </div>
              )}

              {activeTab === 'PROMOS' && (
                <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-foreground">Promotional Campaign Banners</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage festival campaigns, special holiday promotions, flash sales, and announcement images.
                    </p>
                  </div>
                  <BannerEditor
                    banners={content.promotionalBanners}
                    onChange={(val) => updateSection('promotionalBanners', val)}
                  />
                </div>
              )}

              {activeTab === 'PICKERS' && (
                <div className="space-y-6">
                  {/* Collections */}
                  <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm">
                    <CollectionPicker
                      selected={content.featuredCollections}
                      onChange={(val) => updateSection('featuredCollections', val)}
                    />
                  </div>

                  {/* Products */}
                  <ProductPicker
                    sections={content.featuredProducts}
                    onChange={(val) => updateSection('featuredProducts', val)}
                  />
                </div>
              )}

              {activeTab === 'ANNOUNCEMENTS' && (
                <AnnouncementEditor
                  config={content.announcementBar}
                  onChange={(val) => updateSection('announcementBar', val)}
                />
              )}

              {activeTab === 'SEO' && (
                <SeoEditor
                  seo={content.seoSettings}
                  onChange={(val) => updateSection('seoSettings', val)}
                />
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
