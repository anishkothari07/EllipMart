'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MerchantCollectionClient } from '@/lib/services/merchant-collection-client';
import { Plus, Search, RefreshCw, Layers, Edit2, Trash2 } from 'lucide-react';
import { Container } from '@corecart/ui';

export default function MerchantCollectionsListPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await MerchantCollectionClient.listCollections({
        page,
        limit,
        search: search || undefined,
      });
      setCollections(data.items);
      setTotalCount(data.total);
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to retrieve collections.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, [page]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete collection "${name}"?`)) return;
    try {
      await MerchantCollectionClient.deleteCollection(id);
      setStatusMsg({ type: 'success', text: 'Collection deleted successfully.' });
      loadCollections();
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to delete collection.' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCollections();
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">Collections</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Group products manually or dynamically into custom buyer showcases and seasonal catalogs.
          </p>
        </div>

        <Link
          href="/collections/new"
          className="h-10 px-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all font-semibold text-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="size-4" /> Add Collection
        </Link>
      </div>

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

      {/* Search & filter toolbar */}
      <div className="flex gap-4 items-center justify-between bg-card/40 p-4 border border-border/60 rounded-3xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Search collections..."
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
      </div>

      {/* Listing Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-card border border-border/60 rounded-3xl">
          <div className="size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Fetching collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="p-16 border border-border/60 rounded-3xl text-center space-y-4 bg-card">
          <div className="mx-auto size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <Layers className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">No Collections Found</h4>
            <p className="text-xs text-muted-foreground">
              Group products together for marketing or menu catalog listings.
            </p>
          </div>
          <Link
            href="/collections/new"
            className="inline-flex h-10 px-4 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all text-xs font-bold items-center"
          >
            Add Collection
          </Link>
        </div>
      ) : (
        <div className="border border-border/60 rounded-3xl overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60">
                  <th className="p-4 font-semibold text-muted-foreground">Collection Name</th>
                  <th className="p-4 font-semibold text-muted-foreground">Slug</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Assigned Products</th>
                  <th className="p-4 font-semibold text-muted-foreground">Type</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <Link href={`/collections/${col.id}`} className="font-bold text-foreground hover:underline">
                        {col.name}
                      </Link>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-muted-foreground">/{col.slug}</td>
                    <td className="p-4 text-center font-bold text-foreground">
                      {col.products?.length || 0} items
                    </td>
                    <td className="p-4 font-semibold text-muted-foreground">
                      {col.isAutomatic ? (
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                          Smart (Auto)
                        </span>
                      ) : (
                        <span className="text-[10px] bg-muted text-foreground px-2 py-0.5 rounded-full border uppercase tracking-wider">
                          Manual
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          col.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border/80'
                        }`}
                      >
                        {col.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/collections/${col.id}`}
                          className="size-8 rounded-lg border border-border/80 bg-card hover:bg-muted/50 transition-colors flex items-center justify-center text-muted-foreground"
                          title="Edit Collection"
                        >
                          <Edit2 className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(col.id, col.name)}
                          className="size-8 rounded-lg border border-border/80 bg-card hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center text-muted-foreground"
                          title="Delete Collection"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination controls footer */}
      {!loading && collections.length > 0 && (
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
