'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle2, Eye, EyeOff, Calendar, Settings } from 'lucide-react';
import type { AnnouncementBarConfig, Announcement } from '@corecart/commerce';

interface AnnouncementEditorProps {
  config: AnnouncementBarConfig;
  onChange: (updated: AnnouncementBarConfig) => void;
}

export function AnnouncementEditor({ config, onChange }: AnnouncementEditorProps) {
  const [newText, setNewText] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleBar = () => {
    onChange({ ...config, isActive: !config.isActive });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const added: Announcement = {
      id: Math.random().toString(36).substring(7),
      text: newText.trim(),
      link: newLink.trim() || undefined,
      startDate: newStart || undefined,
      endDate: newEnd || undefined,
      isActive: true,
    };

    onChange({
      ...config,
      announcements: [...config.announcements, added],
    });

    setNewText('');
    setNewLink('');
    setNewStart('');
    setNewEnd('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    onChange({
      ...config,
      announcements: config.announcements.filter((a) => a.id !== id),
    });
  };

  const toggleAnnouncement = (id: string) => {
    onChange({
      ...config,
      announcements: config.announcements.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      ),
    });
  };

  const updateThreshold = (val: string) => {
    const parsed = parseInt(val);
    onChange({
      ...config,
      freeShippingThreshold: isNaN(parsed) ? 0 : parsed,
    });
  };

  return (
    <div className="p-5 border border-border/80 bg-card rounded-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Megaphone className="size-4.5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Announcement Bar</h3>
        </div>

        <button
          onClick={toggleBar}
          className={`px-3 py-1 text-[10px] font-bold border rounded-xl transition-colors ${
            config.isActive
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-border bg-muted text-muted-foreground'
          }`}
        >
          {config.isActive ? 'Bar Enabled' : 'Bar Disabled'}
        </button>
      </div>

      {/* Free Shipping Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-4 bg-muted/20 border border-border/60 rounded-2xl">
        <div>
          <h4 className="text-xs font-bold text-foreground">Free Shipping Banner</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
            Configure threshold to trigger free shipping tags on checkout carts automatically.
          </p>
        </div>
        <div className="flex items-center gap-2 self-center">
          <span className="text-xs font-semibold text-muted-foreground">Threshold (₹)</span>
          <input
            type="number"
            value={config.freeShippingThreshold}
            onChange={(e) => updateThreshold(e.target.value)}
            className="w-24 px-2.5 py-1 text-xs border border-border bg-background rounded-lg outline-none font-bold text-foreground"
          />
        </div>
      </div>

      {/* Announcements Manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Announcement Items ({config.announcements.length})</span>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold border border-border hover:bg-muted/50 rounded-lg"
            >
              <Plus className="size-3" />
              Add Message
            </button>
          )}
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} className="p-3 border border-border bg-muted/10 rounded-2xl space-y-3 text-left animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Announcement Text</label>
              <input
                type="text"
                required
                placeholder="e.g. Mid-season clearance sale: Use code CLR20 for extra 20% off!"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground">Target Link / URL (Optional)</label>
              <input
                type="text"
                placeholder="e.g. /search?category=sale"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-border bg-background rounded-lg outline-none"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" />
                  Start Schedule
                </label>
                <input
                  type="datetime-local"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full px-2 py-1 text-[10px] border border-border bg-background rounded-lg outline-none text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" />
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full px-2 py-1 text-[10px] border border-border bg-background rounded-lg outline-none text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 text-[9px] font-bold border border-border hover:bg-muted/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[9px] font-bold bg-foreground text-background hover:bg-foreground/90 rounded-lg"
              >
                Add Announcement
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="space-y-2">
          {config.announcements.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4 italic border border-dashed rounded-xl">
              No custom announcements configured.
            </p>
          ) : (
            config.announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-3 border border-border/60 bg-muted/20 rounded-xl flex items-center justify-between gap-4 ${
                  !ann.isActive && 'opacity-60'
                }`}
              >
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-foreground leading-normal">{ann.text}</p>
                  {ann.link && (
                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate">Link: {ann.link}</p>
                  )}
                  {ann.startDate && (
                    <p className="text-[8px] text-accent mt-0.5 font-bold">
                      Scheduled: {new Date(ann.startDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAnnouncement(ann.id)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                  >
                    {ann.isActive ? <Eye className="size-3.5 text-emerald-500" /> : <EyeOff className="size-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
