import React from 'react';

export const dynamic = 'force-dynamic';
import { BrandForm } from '@/components/merchant/brand/BrandForm';
import { MerchantBrandClient } from '@/lib/services/merchant-brand-client';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Create Brand | EllipMart Superadmin' };

export default function NewBrandPage() {
  const handleSave = async (data: any) => {
    'use server';
    await MerchantBrandClient.createBrand(data);
    redirect('/brands');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <BrandForm onSave={handleSave} />
    </div>
  );
}
