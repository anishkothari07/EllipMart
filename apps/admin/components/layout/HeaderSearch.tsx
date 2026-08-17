'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export function HeaderSearch() {
  const [query, setQuery] = useState('');
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, orders..."
        className="w-full h-10 pl-10 pr-4 rounded-full border border-border/80 bg-muted/30 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground/20 focus:bg-muted/50 transition-colors"
      />
    </div>
  );
}
