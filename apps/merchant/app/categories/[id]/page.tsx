'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MerchantCategoryClient } from '@/lib/services/merchant-category-client';
import { CategoryForm } from '@/components/merchant/category/CategoryForm';
import { CategoryNode } from '@/components/merchant/category/CategoryTree';

export default function EditCategoryPage() {
  const params = useParams();
  const catId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any | null>(null);
  const [flatCats, setFlatCats] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    if (!catId) return;
    try {
      const [catData, tree] = await Promise.all([
        MerchantCategoryClient.getCategory(catId),
        MerchantCategoryClient.getCategoryTree(),
      ]);

      const list: { id: string; name: string }[] = [];
      const traverse = (nodes: CategoryNode[]) => {
        nodes.forEach((n) => {
          list.push({ id: n.id, name: n.name });
          if (n.children && n.children.length > 0) traverse(n.children);
        });
      };
      traverse(tree);

      setCategory(catData);
      setFlatCats(list);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve category details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [catId]);

  const handleSave = async (formData: any) => {
    await MerchantCategoryClient.updateCategory(catId, formData);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Retrieving category record details...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="py-20 text-center text-sm text-destructive">
        {error || 'Failed to display category editor.'}
      </div>
    );
  }

  return (
    <ProductFormWrapper>
      <CategoryForm
        initialCategory={category}
        allFlatCategories={flatCats}
        onSave={handleSave}
      />
    </ProductFormWrapper>
  );
}

// Simple wrapper container
function ProductFormWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
