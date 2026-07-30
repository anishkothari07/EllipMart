'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MerchantCategoryClient } from '@/lib/services/merchant-category-client';
import { CategoryTree, CategoryNode } from '@/components/merchant/category/CategoryTree';
import { Plus, RefreshCw, FolderSearch, AlertCircle } from 'lucide-react';

export default function MerchantCategoryListPage() {
  const [treeNodes, setTreeNodes] = useState<CategoryNode[]>([]);
  const [flatCategories, setFlatCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const tree = await MerchantCategoryClient.getCategoryTree();
      setTreeNodes(tree);

      // Compile a flat list of categories for dropdown parents
      const flatList: { id: string; name: string }[] = [];
      const traverse = (list: CategoryNode[]) => {
        list.forEach((node) => {
          flatList.push({ id: node.id, name: node.name });
          if (node.children && node.children.length > 0) traverse(node.children);
        });
      };
      traverse(tree);
      setFlatCategories(flatList);
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to retrieve categories tree.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoveCategory = async (id: string, parentId: string | null, sortOrder: number) => {
    try {
      await MerchantCategoryClient.moveCategory(id, parentId, sortOrder);
      await loadData();
      setStatusMsg({ type: 'success', text: 'Category structure reorganized successfully.' });
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to reorder categories.' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await MerchantCategoryClient.deleteCategory(id);
      await loadData();
      setStatusMsg({ type: 'success', text: 'Category deleted successfully.' });
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to delete category.' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">Categories</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize products into hierarchical departments, shelves, and nested groups.
          </p>
        </div>

        <Link
          href="/categories/new"
          className="h-10 px-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all font-semibold text-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="size-4" /> Add Category
        </Link>
      </div>

      {statusMsg && (
        <div
          onClick={() => setStatusMsg(null)}
          className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-card border border-border/60 rounded-3xl">
          <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Fetching category trees...</p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl border border-border/60 bg-card/30">
          <CategoryTree
            nodes={treeNodes}
            allFlatCategories={flatCategories}
            onMove={handleMoveCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      )}
    </div>
  );
}
