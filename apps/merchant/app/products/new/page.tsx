'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantProductClient } from '@/lib/services/merchant-product-client';
import { ProductForm } from '@/components/merchant/product/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ brands: any[]; categories: any[]; collections: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const data = await MerchantProductClient.getMetadata();
        setMeta(data);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve catalog setup metadata.');
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, []);

  const handleSave = async (formData: any) => {
    const res = await MerchantProductClient.createProduct(formData);
    // Redirect to edit page of created product
    router.push(`/products/${res.id}`);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Loading form configuration...</p>
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="py-20 text-center text-sm text-destructive">
        {error || 'Catalog metadata failed to load.'}
      </div>
    );
  }

  return (
    <ProductForm
      brands={meta.brands}
      categories={meta.categories}
      collections={meta.collections}
      onSave={handleSave}
    />
  );
}
