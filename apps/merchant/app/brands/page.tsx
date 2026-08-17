import React from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import { MerchantBrandClient } from '@/lib/services/merchant-brand-client';
import { BrandTable } from '@/components/merchant/brand/BrandTable';

export const metadata = { title: 'Brands | EllipMart Superadmin' };

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search || '';

  const data = await MerchantBrandClient.listBrands({ page, limit: 15, search });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product brands and vendors.</p>
        </div>
        <Link
          href="/brands/new"
          className="h-10 px-6 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all font-semibold text-xs flex items-center gap-2"
        >
          <PlusCircle className="size-4" /> Add Brand
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border/60">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search brands..."
            defaultValue={search}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-transparent bg-muted/50 focus:bg-background focus:border-border/80 outline-none text-sm transition-all"
            // For a real app we'd use a client component or a form for search routing
          />
        </div>
      </div>

      <BrandTable
        brands={data?.items || []}
        onBulkDelete={async (ids) => {
          'use server';
          await MerchantBrandClient.bulkDelete(ids);
        }}
      />
    </div>
  );
}
