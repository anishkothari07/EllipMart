'use client';

import React from 'react';
import { MediaLibrary } from '@/components/seller/marketing/MediaLibrary';
import { ChevronRight, LayoutGrid } from 'lucide-react';

export default function MerchantMediaPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Operations</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground">Media Library</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif mt-1">Media Library</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Upload, manage, tag, and search digital assets for hero slides, promotional campaigns, and catalog variants.
        </p>
      </div>

      {/* Standalone Media Library panel */}
      <MediaLibrary />
    </div>
  );
}
