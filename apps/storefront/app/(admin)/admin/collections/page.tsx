'use client';

import React, { useEffect, useState } from 'react';
import { fetchCollectionsAction } from './actions';
import { Tag } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollectionsAction().then(res => {
      if (res.success) setCollections(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">Curated product collections for the storefront.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1.5 rounded-xl">
          <Tag className="size-3.5" />
          {collections.length} Collections
        </div>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
        ) : !collections.length ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Tag className="size-10 opacity-20" />
            <p className="text-sm font-medium">No collections yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {collections.map((col: any) => (
                <tr key={col.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-bold text-foreground">{col.name}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">{col.slug}</td>
                  <td className="px-5 py-3.5 text-xs font-medium">{col._count?.products ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
