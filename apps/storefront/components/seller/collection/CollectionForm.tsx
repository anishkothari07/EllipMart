'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Search, Layers } from 'lucide-react';
import { MerchantProductClient } from '@/lib/services/merchant-product-client';
import Link from 'next/link';

interface CollectionFormProps {
  initialCollection?: any; // Undefined when creating new
  onSave: (data: any) => Promise<void>;
}

export function CollectionForm({ initialCollection, onSave }: CollectionFormProps) {
  const router = useRouter();

  const defaultCollection = {
    name: '',
    slug: '',
    description: '',
    isAutomatic: false,
    isActive: true,
    productIds: [],
    seo: { title: '', description: '' },
  };

  const [formData, setFormData] = useState<any>(defaultCollection);
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');
  
  const [productsList, setProductsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products list for manual selector
  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const data = await MerchantProductClient.listProducts({ limit: 100 });
        setProductsList(data?.items || []);
      } catch (e) {
        console.error('Failed to load products list:', e);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  // Setup form values on mount / collection load
  useEffect(() => {
    if (initialCollection) {
      const productIds = initialCollection.products?.map((p: any) => p.productId) || [];
      const mapped = {
        name: initialCollection.name || '',
        slug: initialCollection.slug || '',
        description: initialCollection.description || '',
        isAutomatic: initialCollection.isAutomatic || false,
        isActive: initialCollection.isActive !== undefined ? initialCollection.isActive : true,
        productIds,
        seo: {
          title: initialCollection.seo?.title || '',
          description: initialCollection.seo?.description || '',
        },
      };
      setFormData(mapped);
      setInitialSnapshot(JSON.stringify(mapped));
    } else {
      setFormData(defaultCollection);
      setInitialSnapshot(JSON.stringify(defaultCollection));
    }
  }, [initialCollection]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-');
    setFormData((prev: any) => ({ ...prev, name, slug }));
  };

  const handleProductToggle = (productId: string) => {
    const ids = formData.productIds || [];
    const updated = ids.includes(productId)
      ? ids.filter((id: string) => id !== productId)
      : [...ids, productId];
    setFormData((prev: any) => ({ ...prev, productIds: updated }));
  };

  const handleSeoChange = (field: string, val: string) => {
    setFormData((prev: any) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: val,
      },
    }));
  };

  const hasUnsavedChanges = JSON.stringify(formData) !== initialSnapshot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(formData);
      setInitialSnapshot(JSON.stringify(formData));
      router.push('/collections');
    } catch (err: any) {
      setError(err.message || 'Failed to save collection details.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24 relative animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/collections"
            className="grid size-10 place-items-center rounded-full border border-border/80 bg-card hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="size-4 text-muted-foreground" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              {initialCollection ? 'Edit Collection' : 'Create Collection'}
            </h1>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-0.5">
              Collection Organization Details
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-bold">Failed to Save Collection</p>
            <p className="font-normal opacity-90 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left column: basic inputs, products selector, SEO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground">General Information</h3>

            <div className="grid gap-5">
              {/* Collection Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Special Collection"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. summer-special-collection"
                  value={formData.slug}
                  onChange={(e) => setFormData((p: any) => ({ ...p, slug: e.target.value }))}
                  className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors font-mono"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  rows={4}
                  placeholder="Tell customers about this collection grouping..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData((p: any) => ({ ...p, description: e.target.value }))}
                  className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Manual vs Smart Products selector */}
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Products in Collection</h3>

            <div className="space-y-4">
              {/* Type radios */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="radio"
                    name="collection-type"
                    checked={!formData.isAutomatic}
                    onChange={() => setFormData((p: any) => ({ ...p, isAutomatic: false }))}
                    className="size-4 rounded border-border accent-foreground"
                  />
                  Manual Selection
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="radio"
                    name="collection-type"
                    checked={formData.isAutomatic}
                    onChange={() => setFormData((p: any) => ({ ...p, isAutomatic: true }))}
                    className="size-4 rounded border-border accent-foreground"
                  />
                  Automatic Rules (Smart)
                </label>
              </div>

              {/* Automatic rule placeholder */}
              {formData.isAutomatic ? (
                <div className="p-8 border border-dashed border-indigo-500/20 bg-indigo-500/5 rounded-2xl flex flex-col items-center gap-3 text-center">
                  <Layers className="size-8 text-indigo-500/80 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Smart Collection Builder</p>
                    <p className="text-[10px] text-muted-foreground">
                      Coming Soon: Compile collection catalogs dynamically based on price filters, brands, or tag matching criteria.
                    </p>
                  </div>
                </div>
              ) : (
                /* Manual products picker table */
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
                    <input
                      type="text"
                      placeholder="Search catalog products to assign..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 rounded-xl border border-border/80 bg-muted/20 text-xs font-medium outline-none focus:border-foreground/30 transition-colors"
                    />
                  </div>

                  <div className="border border-border/60 rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-border/60 bg-muted/10">
                    {loadingProducts ? (
                      <p className="p-4 text-center text-xs text-muted-foreground">Loading catalog items...</p>
                    ) : filteredProducts.length === 0 ? (
                      <p className="p-4 text-center text-xs text-muted-foreground">No matches found</p>
                    ) : (
                      filteredProducts.map((p) => {
                        const isChecked = formData.productIds?.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-3 p-3 text-xs font-bold text-foreground cursor-pointer select-none hover:bg-muted/30 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleProductToggle(p.id)}
                              className="size-4 rounded border-border accent-foreground shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate">{p.name}</span>
                              <span className="text-[9px] text-muted-foreground font-mono truncate mt-0.5">SKU: {p.sku}</span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEO fields */}
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Search Engine Optimization</h3>

            <div className="grid gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SEO Title</label>
                <input
                  type="text"
                  placeholder={formData.name || 'e.g. Summer Special items'}
                  value={formData.seo?.title || ''}
                  onChange={(e) => handleSeoChange('title', e.target.value)}
                  className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SEO Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Meta description snippet for searches..."
                  value={formData.seo?.description || ''}
                  onChange={(e) => handleSeoChange('description', e.target.value)}
                  className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: active status */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Visibility Status</h3>

            <div className="grid gap-5">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p: any) => ({ ...p, isActive: e.target.checked }))}
                  className="size-4 rounded border-border accent-foreground"
                />
                Collection is Active & Visible
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save changes bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-bottom duration-300">
          <div className="p-4 rounded-3xl border border-border bg-card shadow-float flex items-center justify-between gap-6 backdrop-blur-md bg-card/90">
            <span className="text-xs font-bold text-foreground pl-2 select-none">
              Unsaved changes
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData(JSON.parse(initialSnapshot))}
                disabled={saving}
                className="h-10 px-4 rounded-full border border-border hover:bg-muted/50 transition-colors text-xs font-semibold disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving && <div className="size-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
