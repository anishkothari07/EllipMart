'use client';

import React from 'react';
import { MerchantCollectionClient } from '@/lib/services/merchant-collection-client';
import { CollectionForm } from '@/components/merchant/collection/CollectionForm';

export default function NewCollectionPage() {
  const handleSave = async (formData: any) => {
    await MerchantCollectionClient.createCollection(formData);
  };

  return <CollectionForm onSave={handleSave} />;
}
