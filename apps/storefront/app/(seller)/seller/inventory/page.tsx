'use client';

import React, { useEffect, useState } from 'react';
import { MerchantInventoryClient } from '@/lib/services/merchant-inventory-client';
import { InventoryTable } from '@/components/seller/inventory/InventoryTable';
import { Search, RefreshCw, Layers } from 'lucide-react';

export default function MerchantInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await MerchantInventoryClient.listInventory({
        page,
        limit,
        search: search || undefined,
        lowStockOnly: lowStockFilter || undefined,
      });
      setInventory(data.items);
      setTotalCount(data.total);
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to retrieve inventory metrics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [page, lowStockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadInventory();
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">Inventory</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track variant quantities, log stock updates, and configure low stock alert limits.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          onClick={() => setStatusMsg(null)}
          className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer border-destructive/20 bg-destructive/10 text-destructive`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Toolbar filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card/40 p-4 border border-border/60 rounded-3xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Search variants by name, SKU..."
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

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => {
                setLowStockFilter(e.target.checked);
                setPage(1);
              }}
              className="size-4 rounded border-border accent-foreground"
            />
            Low stock alerts only
          </label>

          <button
            onClick={() => {
              setSearch('');
              setLowStockFilter(false);
              setPage(1);
              loadInventory();
            }}
            className="size-10 rounded-xl border border-border bg-card hover:bg-muted/50 flex items-center justify-center text-muted-foreground transition-colors shrink-0"
            title="Reset filters"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Grid table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-card border border-border/60 rounded-3xl">
          <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Fetching stock quantities...</p>
        </div>
      ) : (
        <InventoryTable inventory={inventory} onRefresh={loadInventory} />
      )}

      {/* Pagination footer */}
      {!loading && inventory.length > 0 && (
        <div className="flex justify-end gap-3 py-2 border-t border-border/60">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 disabled:opacity-40 flex items-center justify-center text-xs font-semibold"
          >
            Previous
          </button>
          <span className="text-xs font-bold flex items-center text-foreground">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="h-9 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 disabled:opacity-40 flex items-center justify-center text-xs font-semibold"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
