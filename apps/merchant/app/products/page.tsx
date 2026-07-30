'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MerchantProductClient } from '@/lib/services/merchant-product-client';
import { ProductTable } from '@/components/merchant/product/ProductTable';
import { Plus, Search, RefreshCw, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { Container } from '@corecart/ui';

export default function MerchantProductListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('updatedAt_desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMetadata = async () => {
    try {
      const meta = await MerchantProductClient.getMetadata();
      setCategories(meta.categories);
    } catch (e) {
      console.error('Failed to load categories metadata:', e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await MerchantProductClient.listProducts({
        page,
        limit,
        search: search || undefined,
        categoryId: catFilter || undefined,
        status: (statusFilter as any) || undefined,
        sort: sortOrder,
      });

      // Map details for the table thumbnail logic (first image if available)
      const mapped = data.items.map((item: any) => ({
        ...item,
        thumbnail: item.images?.[0] || '/placeholder-product.png',
      }));

      setProducts(mapped);
      setTotalCount(data.total);
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to retrieve products list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, limit, statusFilter, catFilter, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleBulkStatusUpdate = async (ids: string[], status: 'ACTIVE' | 'ARCHIVED') => {
    try {
      await MerchantProductClient.bulkUpdateStatus(ids, status);
      setStatusMsg({ type: 'success', text: `Successfully updated status for ${ids.length} product(s).` });
      loadProducts();
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to update products status.' });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await MerchantProductClient.bulkDelete(ids);
      setStatusMsg({ type: 'success', text: `Successfully deleted ${ids.length} product(s).` });
      loadProducts();
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to delete products.' });
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">Product Catalog</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your store storefront listing items, variants, stock, and SEO mappings.
          </p>
        </div>

        <Link
          href="/products/new"
          className="h-10 px-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all font-semibold text-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="size-4" /> Add Product
        </Link>
      </div>

      {/* Status banner */}
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

      {/* Search and filter controls bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card/40 p-4 border border-border/60 rounded-3xl backdrop-blur-md">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Search products by title, variant SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-card text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-xs font-bold"
          >
            Search
          </button>
        </form>

        {/* Filters checklist */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status select */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3.5 rounded-xl border border-border bg-card text-xs font-bold outline-none cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category filter */}
          <select
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3.5 rounded-xl border border-border bg-card text-xs font-bold outline-none cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3.5 rounded-xl border border-border bg-card text-xs font-bold outline-none cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <option value="updatedAt_desc">Newest updated</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>

          {/* Reset button */}
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setCatFilter('');
              setSortOrder('updatedAt_desc');
              setPage(1);
            }}
            className="size-10 rounded-xl border border-border bg-card hover:bg-muted/50 flex items-center justify-center text-muted-foreground transition-colors shrink-0"
            title="Reset filters"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Products table grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-card border border-border/60 rounded-3xl">
          <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Fetching product records...</p>
        </div>
      ) : (
        <ProductTable
          products={products}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {/* Pagination control footer bar */}
      {!loading && products.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 rounded-lg border border-border bg-card text-xs font-bold outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-muted-foreground ml-2">
              Total: {totalCount} records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="size-9 rounded-xl border border-border bg-card hover:bg-muted/50 disabled:opacity-40 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <span className="text-xs font-bold text-foreground">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="size-9 rounded-xl border border-border bg-card hover:bg-muted/50 disabled:opacity-40 flex items-center justify-center transition-colors"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
