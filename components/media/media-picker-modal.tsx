'use client';

import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { MediaLibraryView, MediaItem } from './media-library-view';

export interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: (media: MediaItem) => void;
  title?: string;
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelectMedia,
  title = 'Select Media Asset',
}: MediaPickerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs">
      <div className="flex flex-col h-[90vh] w-full max-w-6xl rounded-3xl border border-border bg-background shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-5 text-indigo-500" />
            <h2 className="text-base font-bold">{title}</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl p-1.5 hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Embedded Media Library Container */}
        <div className="flex-1 overflow-hidden">
          <MediaLibraryView
            isPicker={true}
            onSelectMedia={(media) => {
              onSelectMedia(media);
              onOpenChange(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
