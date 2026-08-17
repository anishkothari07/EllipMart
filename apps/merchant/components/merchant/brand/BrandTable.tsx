'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DeleteDialog } from '../product/DeleteDialog';
import { Edit2, Trash2, Tag, CheckCircle, XCircle } from 'lucide-react';

interface BrandTableProps {
  brands: any[];
  onBulkDelete: (ids: string[]) => Promise<void>;
}

export function BrandTable({ brands, onBulkDelete }: BrandTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteBrand, setDeleteBrand] = useState<any | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(brands.map((b) => b.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedIds([...selectedIds, id]);
    else setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  const triggerBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} brands?`)) return;
    setBulkActionLoading(true);
    try {
      await onBulkDelete(selectedIds);
      setSelectedIds([]);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBrand) return;
    await onBulkDelete([deleteBrand.id]);
    setDeleteBrand(null);
  };

  const allSelected = brands.length > 0 && selectedIds.length === brands.length;

  return (
    <div className="space-y-4">
      {/* Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in duration-200">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 select-none pl-1">
            {selectedIds.length} brand(s) selected
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={triggerBulkDelete}
              disabled={bulkActionLoading}
              className="h-9 px-3 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="border border-border/60 rounded-3xl overflow-hidden bg-card shadow-sm">
        {brands.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="mx-auto size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
              <Tag className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">No Brands Found</h4>
              <p className="text-xs text-muted-foreground">
                Get started by creating your first brand.
              </p>
            </div>
            <Link
              href="/brands/new"
              className="inline-flex h-10 px-4 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all text-xs font-bold items-center"
            >
              Create Brand
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="size-4 rounded border-border accent-foreground cursor-pointer"
                    />
                  </th>
                  <th className="p-4 font-semibold text-muted-foreground">Name</th>
                  <th className="p-4 font-semibold text-muted-foreground">Slug</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Products</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {brands.map((b) => {
                  const isSelected = selectedIds.includes(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? 'bg-muted/10' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(b.id, e.target.checked)}
                          className="size-4 rounded border-border accent-foreground cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-bold text-foreground">{b.name}</td>
                      <td className="p-4 font-mono text-[10px] text-muted-foreground">{b.slug}</td>
                      <td className="p-4 text-center">
                        {b.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle className="size-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <XCircle className="size-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-foreground">
                        {b._count?.products || 0}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/brands/${b.id}`}
                            className="size-8 rounded-lg border border-border/80 bg-card hover:bg-muted/50 transition-colors flex items-center justify-center text-muted-foreground"
                          >
                            <Edit2 className="size-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteBrand(b)}
                            className="size-8 rounded-lg border border-border/80 bg-card hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center text-muted-foreground"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={!!deleteBrand}
        onClose={() => setDeleteBrand(null)}
        onConfirm={handleDeleteConfirm}
        productName={deleteBrand?.name || ''}
      />
    </div>
  );
}
