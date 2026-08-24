'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminProductClient } from '@/lib/services/admin-product-client';
import { ProductForm } from '@/components/admin/product/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);
  const [meta, setMeta] = useState<{ brands: any[]; categories: any[]; collections: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    if (!productId) return;
    try {
      const [prodData, metaData] = await Promise.all([
        AdminProductClient.getProduct(productId),
        AdminProductClient.getMetadata(),
      ]);
      setProduct(prodData);
      setMeta(metaData || null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve product details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [productId]);

  const handleSave = async (formData: any) => {
    await AdminProductClient.updateProduct(productId, formData);
    // Reload fields after successful save
    await loadData();
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Retrieving product record details...</p>
      </div>
    );
  }

  if (error || !product || !meta) {
    return (
      <div className="py-20 text-center text-sm text-destructive">
        {error || 'Failed to display product editor.'}
      </div>
    );
  }

  return (
    <ProductForm
      initialProduct={product}
      brands={meta.brands}
      categories={meta.categories}
      collections={meta.collections}
      onSave={handleSave}
    />
  );
}
