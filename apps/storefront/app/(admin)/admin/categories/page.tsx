'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminCategoriesAction } from '../actions';
import { Layers, ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminCategoriesAction().then(res => {
      if (res.success) setCategories(res.data);
      setLoading(false);
    });
  }, []);

  const topLevel = categories.filter(c => !c.parentId);
  const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform product category hierarchy.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1.5 rounded-xl">
          <Layers className="size-3.5" />
          {categories.length} Categories
        </div>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
        ) : !topLevel.length ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Layers className="size-10 opacity-20" />
            <p className="text-sm font-medium">No categories found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Products</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subcategories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {topLevel.map(cat => (
                <React.Fragment key={cat.id}>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-foreground">{cat.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">{cat.slug}</td>
                    <td className="px-5 py-3.5 text-xs font-medium">{cat._count?.products ?? 0}</td>
                    <td className="px-5 py-3.5 text-xs font-medium">{cat._count?.children ?? 0}</td>
                  </tr>
                  {getChildren(cat.id).map(child => (
                    <tr key={child.id} className="hover:bg-muted/10 transition-colors bg-muted/5">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2 ml-4">
                          <ChevronRight className="size-3 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">{child.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground font-mono">{child.slug}</td>
                      <td className="px-5 py-2.5 text-xs font-medium">{child._count?.products ?? 0}</td>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground">—</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
