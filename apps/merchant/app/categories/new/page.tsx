'use client';

import React, { useEffect, useState } from 'react';
import { MerchantCategoryClient } from '@/lib/services/merchant-category-client';
import { CategoryForm } from '@/components/merchant/category/CategoryForm';
import { CategoryNode } from '@/components/merchant/category/CategoryTree';

export default function NewCategoryPage() {
  const [loading, setLoading] = useState(true);
  const [flatCats, setFlatCats] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const tree = await MerchantCategoryClient.getCategoryTree();
        const list: { id: string; name: string }[] = [];
        const traverse = (nodes: CategoryNode[]) => {
          nodes.forEach((n) => {
            list.push({ id: n.id, name: n.name });
            if (n.children && n.children.length > 0) traverse(n.children);
          });
        };
        traverse(tree);
        setFlatCats(list);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve categories hierarchy.');
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, []);

  const handleSave = async (formData: any) => {
    await MerchantCategoryClient.createCategory(formData);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Loading form configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <CategoryForm
      allFlatCategories={flatCats}
      onSave={handleSave}
    />
  );
}
