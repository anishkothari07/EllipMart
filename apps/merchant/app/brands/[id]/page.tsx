import React from 'react';

export const dynamic = 'force-dynamic';
import { BrandForm } from '@/components/merchant/brand/BrandForm';
import { MerchantBrandClient } from '@/lib/services/merchant-brand-client';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Edit Brand | EllipMart Superadmin' };

export default async function EditBrandPage({ params }: { params: { id: string } }) {
  let brand;
  try {
    brand = await MerchantBrandClient.getBrand(params.id);
  } catch (error) {
    redirect('/brands');
  }

  const handleSave = async (data: any) => {
    'use server';
    await MerchantBrandClient.updateBrand(params.id, data);
    redirect('/brands');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <BrandForm initialBrand={brand} onSave={handleSave} />
    </div>
  );
}
