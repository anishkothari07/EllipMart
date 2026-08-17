'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { DeleteDialog } from './DeleteDialog';
import { formatPrice } from '@corecart/shared';
import { Edit2, Trash2, Eye, Download, Archive, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface ProductTableProps {
  products: any[];
  onBulkStatusUpdate: (ids: string[], status: 'ACTIVE' | 'ARCHIVED') => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
}

export function ProductTable({ products, onBulkStatusUpdate, onBulkDelete }: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const triggerBulkStatus = async (status: 'ACTIVE' | 'ARCHIVED') => {
    setBulkActionLoading(true);
    try {
      await onBulkStatusUpdate(selectedIds, status);
      setSelectedIds([]);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const triggerBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    setBulkActionLoading(true);
    try {
      await onBulkDelete(selectedIds);
      setSelectedIds([]);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    // Generate JSON download for selected products details
    const selectedData = products.filter((p) => selectedIds.includes(p.id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(selectedData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `merchant-products-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;
    await onBulkDelete([deleteProduct.id]);
    setDeleteProduct(null);
  };

  const allSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="space-y-4">
      {/* Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in duration-200">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 select-none pl-1">
            {selectedIds.length} product(s) selected
          </span>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerBulkStatus('ACTIVE')}
              disabled={bulkActionLoading}
              className="h-9 px-3 rounded-xl border border-indigo-200 bg-card hover:bg-muted/50 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckCircle className="size-3.5 text-emerald-600" /> Activate
            </button>
            <button
              onClick={() => triggerBulkStatus('ARCHIVED')}
              disabled={bulkActionLoading}
              className="h-9 px-3 rounded-xl border border-indigo-200 bg-card hover:bg-muted/50 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Archive className="size-3.5 text-amber-600" /> Archive
            </button>
            <button
              onClick={handleBulkExport}
              className="h-9 px-3 rounded-xl border border-indigo-200 bg-card hover:bg-muted/50 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="size-3.5" /> Export JSON
            </button>
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

      {/* Main product catalog list table */}
      <div className="border border-border/60 rounded-3xl overflow-hidden bg-card shadow-sm">
        {products.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="mx-auto size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
              <Archive className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">No Products Found</h4>
              <p className="text-xs text-muted-foreground">
                Get started by creating your first product listing in the catalog.
              </p>
            </div>
            <Link
              href="/products/new"
              className="inline-flex h-10 px-4 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all text-xs font-bold items-center"
            >
              Create Product
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
                  <th className="p-4 font-semibold text-muted-foreground">Product</th>
                  <th className="p-4 font-semibold text-muted-foreground">SKU</th>
                  <th className="p-4 font-semibold text-muted-foreground">Price</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Inventory</th>
                  <th className="p-4 font-semibold text-muted-foreground">Category</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.inventory <= 5;
                  
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? 'bg-muted/10' : ''
                      }`}
                    >
                      {/* Checkbox select */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                          className="size-4 rounded border-border accent-foreground cursor-pointer"
                        />
                      </td>

                      {/* Product Name & Thumbnail */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl border border-border bg-muted/40 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {p.thumbnail ? (
                              <Image
                                src={p.thumbnail}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground select-none">No Img</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/products/${p.id}`}
                              className="font-bold text-foreground hover:underline truncate"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[9px] text-muted-foreground truncate mt-0.5">
                              {p.brand?.name || 'No Brand'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-mono text-[10px] text-muted-foreground">{p.sku}</td>

                      {/* Price */}
                      <td className="p-4 font-semibold text-foreground">
                        {formatPrice(p.price, 'INR')}
                      </td>

                      {/* Inventory Count */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLowStock
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {p.inventory} in stock
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-muted-foreground font-medium">
                        {p.category?.name || 'Uncategorized'}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Row actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-8 rounded-lg border border-border/80 bg-card hover:bg-muted/50 transition-colors flex items-center justify-center text-muted-foreground"
                            title="Preview store page"
                          >
                            <Eye className="size-3.5" />
                          </a>
                          <Link
                            href={`/products/${p.id}`}
                            className="size-8 rounded-lg border border-border/80 bg-card hover:bg-muted/50 transition-colors flex items-center justify-center text-muted-foreground"
                            title="Edit product"
                          >
                            <Edit2 className="size-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteProduct(p)}
                            className="size-8 rounded-lg border border-border/80 bg-card hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center text-muted-foreground"
                            title="Delete product"
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

      {/* Single delete dialog */}
      <DeleteDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteConfirm}
        productName={deleteProduct?.name || ''}
      />
    </div>
  );
}
