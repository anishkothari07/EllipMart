'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MerchantCollectionClient } from '@/lib/services/merchant-collection-client';
import { CollectionForm } from '@/components/merchant/collection/CollectionForm';

export default function EditCollectionPage() {
  const params = useParams();
  const colId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    if (!colId) return;
    try {
      const data = await MerchantCollectionClient.getCollection(colId);
      setCollection(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve collection details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [colId]);

  const handleSave = async (formData: any) => {
    await MerchantCollectionClient.updateCollection(colId, formData);
    await loadData();
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">Retrieving collection details...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="py-20 text-center text-sm text-destructive">
        {error || 'Failed to display collection editor.'}
      </div>
    );
  }

  return <CollectionForm initialCollection={collection} onSave={handleSave} />;
}
