'use client';

import React, { useState } from 'react';
import { Upload, X, Star, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { MediaLibrary } from '@/components/merchant/marketing/MediaLibrary';

interface ProductMediaProps {
  formData: any;
  onChange: (fields: any) => void;
}

export function ProductMedia({ formData, onChange }: ProductMediaProps) {
  const images = formData.images || [];
  const [mockUploadUrl, setMockUploadUrl] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleAddMockImage = () => {
    if (!mockUploadUrl.trim()) return;

    const newUrl = mockUploadUrl.trim();
    const updated = [...images, newUrl];
    onChange({ images: updated });
    setMockUploadUrl('');
  };

  const handleSelectFromLibrary = (url: string) => {
    if (!url) return;
    if (images.includes(url)) {
      setShowMediaPicker(false);
      return;
    }
    onChange({ images: [...images, url] });
    setShowMediaPicker(false);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_: any, idx: number) => idx !== index);
    onChange({ images: updated });
  };

  const handleSetFeatured = (index: number) => {
    const selected = images[index];
    const rest = images.filter((_: any, idx: number) => idx !== index);
    onChange({ images: [selected, ...rest] });
  };

  const handleMoveItem = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === images.length - 1) return;

    const updated = [...images];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    onChange({ images: updated });
  };

  return (
    <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
      <h3 className="font-serif text-lg font-bold text-foreground">Product Media</h3>

      {/* Add via URL or open Media Library */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Paste image URL (e.g. https://example.com/image.png)"
            value={mockUploadUrl}
            onChange={(e) => setMockUploadUrl(e.target.value)}
            className="h-11 px-4 flex-1 rounded-xl border border-border bg-muted/20 text-xs font-mono outline-none focus:border-foreground/30 transition-colors"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMockImage(); } }}
          />
          <button
            type="button"
            className="h-11 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-xs font-semibold flex items-center gap-1.5 shrink-0"
            onClick={(e) => { e.preventDefault(); handleAddMockImage(); }}
          >
            <Upload className="size-4" /> Add URL
          </button>
        </div>

        {/* Browse Media Library button */}
        <button
          type="button"
          onClick={() => setShowMediaPicker(true)}
          className="w-full h-11 rounded-xl border-2 border-dashed border-border hover:border-foreground/30 hover:bg-muted/20 transition-all text-xs font-semibold flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LayoutGrid className="size-4" />
          Browse Media Library
        </button>
      </div>

      {/* Media Gallery Grid */}
      {images.length === 0 ? (
        <div className="border border-dashed border-border/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <ImageIcon className="size-8 text-muted-foreground/60" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">No media assets added</p>
            <p className="text-[10px] text-muted-foreground">
              Paste an image URL above or browse the Media Library to add images.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((url: string, index: number) => {
            const isFeatured = index === 0;
            return (
              <div
                key={url + index}
                className={`relative group rounded-2xl border bg-muted/40 aspect-square overflow-hidden flex items-center justify-center transition-all ${
                  isFeatured ? 'border-primary/40 ring-1 ring-primary/30' : 'border-border/80'
                }`}
              >
                {/* Image element */}
                {url.startsWith('/') || url.startsWith('http') ? (
                  <Image
                    src={url}
                    alt={`Product asset ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="p-3 text-center text-[10px] font-mono break-all text-muted-foreground">
                    {url}
                  </div>
                )}

                {/* Featured indicator badge */}
                {isFeatured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-bold bg-primary text-primary-foreground uppercase tracking-wider flex items-center gap-0.5 z-10 select-none">
                    <Star className="size-2 fill-current" /> Cover
                  </span>
                )}

                {/* Image controls overlay */}
                <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="size-7 rounded-lg bg-background hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center text-muted-foreground transition-colors"
                      title="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveItem(index, 'UP')}
                        className="size-7 rounded-lg bg-background text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleMoveItem(index, 'DOWN')}
                        className="size-7 rounded-lg bg-background text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>

                    {!isFeatured && (
                      <button
                        type="button"
                        onClick={() => handleSetFeatured(index)}
                        className="h-7 px-2 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground text-[10px] font-bold text-muted-foreground transition-colors"
                      >
                        Cover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Library Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
            <MediaLibrary
              isPicker
              onSelect={handleSelectFromLibrary}
              onClose={() => setShowMediaPicker(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
