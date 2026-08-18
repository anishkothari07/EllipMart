'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Calendar, Image as ImageIcon } from 'lucide-react';
import type { PromotionalBanner } from '@corecart/commerce';
import { MediaLibrary } from './MediaLibrary';

interface BannerEditorProps {
  banners: PromotionalBanner[];
  onChange: (updated: PromotionalBanner[]) => void;
}

const TYPE_OPTIONS = [
  { value: 'FESTIVAL', label: 'Festival Campaigns' },
  { value: 'FLASH_SALE', label: 'Flash Sale Deals' },
  { value: 'OFFER', label: 'Offer Banners' },
  { value: 'ANNOUNCEMENT', label: 'Promo Announcements' },
];

export function BannerEditor({ banners, onChange }: BannerEditorProps) {
  const [editing, setEditing] = useState<PromotionalBanner | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<PromotionalBanner['type']>('OFFER');

  const startEdit = (banner: PromotionalBanner) => {
    setEditing(banner);
    setIsNew(false);
    setTitle(banner.title);
    setDescription(banner.description);
    setButtonText(banner.buttonText);
    setUrl(banner.url);
    setImage(banner.image);
    setPriority(banner.priority);
    setIsActive(banner.isActive);
    setStartDate(banner.startDate);
    setEndDate(banner.endDate);
    setType(banner.type);
  };

  const startNew = () => {
    setEditing({
      id: Math.random().toString(36).substring(7),
      title: '',
      description: '',
      buttonText: 'Shop Now',
      url: '/search',
      image: '',
      priority: 'medium',
      isActive: true,
      startDate: '',
      endDate: '',
      type: 'OFFER',
    });
    setIsNew(true);
    setTitle('');
    setDescription('');
    setButtonText('Shop Now');
    setUrl('/search');
    setImage('');
    setPriority('medium');
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setType('OFFER');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const saved: PromotionalBanner = {
      ...editing,
      title,
      description,
      buttonText,
      url,
      image,
      priority,
      isActive,
      startDate,
      endDate,
      type,
    };

    let updatedList;
    if (isNew) {
      updatedList = [...banners, saved];
    } else {
      updatedList = banners.map((b) => (b.id === saved.id ? saved : b));
    }

    onChange(updatedList);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    onChange(banners.filter((b) => b.id !== id));
  };

  const toggleActive = (id: string) => {
    onChange(banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Promotional Banners ({banners.length})</h3>
        {!editing && (
          <button
            onClick={startNew}
            className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Promo Banner
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSave} className="p-5 border border-border bg-muted/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-150 text-left">
          <h4 className="text-xs font-bold text-foreground">{isNew ? 'New Promotional Banner' : 'Edit Promotional Banner'}</h4>

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
              <label className="text-[10px] font-bold text-muted-foreground">Banner Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PromotionalBanner['type'])}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground">Promo Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">CTA Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">CTA URL / Link</label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Image & Priority */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Banner Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Paste URL or select image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
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

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Display Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-border/80 bg-background rounded-xl outline-none cursor-pointer"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
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
                id="promo-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 border-border rounded cursor-pointer"
              />
              <label htmlFor="promo-active" className="text-xs font-bold text-muted-foreground cursor-pointer">
                Enable immediately
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            >
              Save Campaign
            </button>
          </div>
        </form>
      )}

      {/* Campaign List */}
      {!editing && (
        <div className="space-y-2">
          {banners.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-2xl">
              No promotional banners configured.
            </p>
          ) : (
            banners.map((b) => (
              <div
                key={b.id}
                className="p-4 border border-border/80 bg-card hover:bg-muted/5 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-12 rounded-xl bg-muted overflow-hidden shrink-0">
                    <img src={b.image || '/placeholder-banner.png'} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-foreground leading-snug truncate">
                      {b.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-foreground/10 px-1.5 py-0.5 rounded">
                        {b.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
                        Priority: {b.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(b.id)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    {b.isActive ? <Eye className="size-4 text-emerald-500" /> : <EyeOff className="size-4" />}
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

      {/* Media Library dialog */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl">
            <MediaLibrary
              isPicker
              onSelect={(url) => {
                setImage(url);
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
