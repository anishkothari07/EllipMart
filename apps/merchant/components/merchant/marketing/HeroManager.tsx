'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Eye, EyeOff, LayoutGrid, Calendar, Image as ImageIcon } from 'lucide-react';
import type { HeroBanner } from '@corecart/commerce';
import { MediaLibrary } from './MediaLibrary';

interface HeroManagerProps {
  banners: HeroBanner[];
  onChange: (updated: HeroBanner[]) => void;
}

export function HeroManager({ banners, onChange }: HeroManagerProps) {
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState<'bgImage' | 'mobileImage' | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const startEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setIsNew(false);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setDescription(banner.description);
    setCtaText(banner.ctaText);
    setCtaUrl(banner.ctaUrl);
    setBgImage(banner.bgImage);
    setMobileImage(banner.mobileImage);
    setStartDate(banner.startDate);
    setEndDate(banner.endDate);
    setIsActive(banner.isActive);
  };

  const startNew = () => {
    setEditingBanner({
      id: Math.random().toString(36).substring(7),
      title: '',
      subtitle: '',
      description: '',
      ctaText: 'Shop Now',
      ctaUrl: '/search',
      bgImage: '',
      mobileImage: '',
      startDate: '',
      endDate: '',
      isActive: true,
      sortOrder: banners.length + 1,
    });
    setIsNew(true);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setCtaText('Shop Now');
    setCtaUrl('/search');
    setBgImage('');
    setMobileImage('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    const saved: HeroBanner = {
      ...editingBanner,
      title,
      subtitle,
      description,
      ctaText,
      ctaUrl,
      bgImage,
      mobileImage,
      startDate,
      endDate,
      isActive,
    };

    let updatedList;
    if (isNew) {
      updatedList = [...banners, saved];
    } else {
      updatedList = banners.map((b) => (b.id === saved.id ? saved : b));
    }

    onChange(updatedList);
    setEditingBanner(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;
    onChange(banners.filter((b) => b.id !== id));
  };

  const toggleActive = (id: string) => {
    onChange(banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const updated = [...banners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Re-assign sortOrder
    const reordered = updated.map((b, idx) => ({ ...b, sortOrder: idx + 1 }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Hero Slide Carousels ({banners.length})</h3>
        {!editingBanner && (
          <button
            onClick={startNew}
            className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Slide
          </button>
        )}
      </div>

      {editingBanner && (
        <form onSubmit={handleSave} className="p-5 border border-border bg-muted/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-150 text-left">
          <h4 className="text-xs font-bold text-foreground">{isNew ? 'New Slide Banner' : 'Edit Slide Banner'}</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Subtitle (Optional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">CTA Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">CTA URL / Link</label>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Background and Mobile Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Desktop Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Paste URL or select image"
                  value={bgImage}
                  onChange={(e) => setBgImage(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker('bgImage')}
                  className="px-3 border border-border hover:bg-background rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <ImageIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Mobile Image URL (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste URL or select image"
                  value={mobileImage}
                  onChange={(e) => setMobileImage(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker('mobileImage')}
                  className="px-3 border border-border hover:bg-background rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <ImageIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                Start Date (Schedule)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none text-muted-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                End Date (Expiry)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2 py-2 select-none">
              <input
                type="checkbox"
                id="hero-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 border-border rounded cursor-pointer"
              />
              <label htmlFor="hero-active" className="text-xs font-bold text-muted-foreground cursor-pointer">
                Enable immediately
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setEditingBanner(null)}
              className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            >
              Save Slide
            </button>
          </div>
        </form>
      )}

      {/* Slide list display */}
      {!editingBanner && (
        <div className="space-y-2">
          {banners.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-2xl">
              No slides configured. Add one above.
            </p>
          ) : (
            banners.map((b, idx) => (
              <div
                key={b.id}
                className="p-4 border border-border/80 bg-card hover:bg-muted/5 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-12 rounded-xl bg-muted overflow-hidden shrink-0">
                    <img src={b.bgImage || '/placeholder-banner.png'} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-foreground leading-snug truncate">{b.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{b.subtitle || 'No subtitle'}</p>
                    {b.startDate && (
                      <p className="text-[9px] text-accent mt-0.5 font-semibold">
                        Scheduled: {new Date(b.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(b.id)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    title={b.isActive ? 'Disable' : 'Enable'}
                  >
                    {b.isActive ? <Eye className="size-4 text-emerald-500" /> : <EyeOff className="size-4" />}
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
                    disabled={idx === banners.length - 1}
                    className="p-1 text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ▼
                  </button>

                  <button
                    onClick={() => startEdit(b)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted/50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Media Picker Dialog */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl">
            <MediaLibrary
              isPicker
              onSelect={(url) => {
                if (showMediaPicker === 'bgImage') setBgImage(url);
                if (showMediaPicker === 'mobileImage') setMobileImage(url);
                setShowMediaPicker(null);
              }}
              onClose={() => setShowMediaPicker(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
