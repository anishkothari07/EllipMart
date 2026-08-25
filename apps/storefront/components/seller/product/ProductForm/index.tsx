'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductGeneral } from './ProductGeneral';
import { ProductPricing } from './ProductPricing';
import { ProductInventory } from './ProductInventory';
import { ProductMedia } from './ProductMedia';
import { ProductOrganization } from './ProductOrganization';
import { ProductSeo } from './ProductSeo';
import { ProductVariants } from './ProductVariants';
import { ProductPublishing } from './ProductPublishing';
import { AlertCircle, ArrowLeft, ArrowUpRight, Eye } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialProduct?: any; // Undefined when creating new
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  onSave: (data: any) => Promise<void>;
}

export function ProductForm({ initialProduct, brands, categories, collections, onSave }: ProductFormProps) {
  const router = useRouter();
  
  // Default values for new products
  const defaultProduct = {
    name: '',
    slug: '',
    shortDescription: '',
    longDescription: '',
    brandId: null,
    categoryId: categories[0]?.id || '',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    price: { mrp: 0, sellingPrice: 0, costPrice: null },
    inventory: { quantity: 0, lowStockThreshold: 5 },
    sku: '',
    barcode: '',
    images: [],
    tags: [],
    collectionIds: [],
    seo: { title: '', description: '' },
    variants: [],
  };

  const [formData, setFormData] = useState<any>(defaultProduct);
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup form values on mount / product load
  useEffect(() => {
    if (initialProduct) {
      // Map existing relations to flat properties for the form
      const images = initialProduct.images?.map((img: any) => img.media?.publicUrl || img.media?.path || '') .filter(Boolean) || [];
      const tags = initialProduct.tags?.map((t: any) => t.tag.name) || [];
      const collectionIds = initialProduct.collections?.map((c: any) => c.collectionId) || [];
      
      const mapped = {
        name: initialProduct.name || '',
        slug: initialProduct.slug || '',
        shortDescription: initialProduct.shortDescription || '',
        longDescription: initialProduct.longDescription || '',
        brandId: initialProduct.brandId || null,
        categoryId: initialProduct.categoryId || '',
        status: initialProduct.status || 'DRAFT',
        visibility: initialProduct.visibility || 'PUBLIC',
        images,
        tags,
        collectionIds,
        seo: {
          title: initialProduct.seo?.title || '',
          description: initialProduct.seo?.description || '',
        },
        // Pull details from the first variant if no custom variants exist
        sku: initialProduct.variants?.[0]?.sku || '',
        barcode: initialProduct.variants?.[0]?.barcode || '',
        price: {
          mrp: initialProduct.variants?.[0]?.pricing?.mrp ? Number(initialProduct.variants[0].pricing.mrp) : 0,
          sellingPrice: initialProduct.variants?.[0]?.pricing?.sellingPrice ? Number(initialProduct.variants[0].pricing.sellingPrice) : 0,
          costPrice: initialProduct.variants?.[0]?.pricing?.costPrice ? Number(initialProduct.variants[0].pricing.costPrice) : null,
        },
        inventory: {
          quantity: initialProduct.variants?.[0]?.inventory?.quantityAvailable || 0,
          lowStockThreshold: initialProduct.variants?.[0]?.inventory?.lowStockThreshold || 5,
        },
        // Include custom variants if they exist (more than 1 variant or name is not Default Variant)
        variants: initialProduct.variants && (initialProduct.variants.length > 1 || initialProduct.variants[0]?.name !== 'Default Variant')
          ? initialProduct.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              barcode: v.barcode || '',
              mrp: v.pricing ? Number(v.pricing.mrp) : 0,
              sellingPrice: v.pricing ? Number(v.pricing.sellingPrice) : 0,
              costPrice: v.pricing?.costPrice ? Number(v.pricing.costPrice) : 0,
              quantity: v.inventory?.quantityAvailable || 0,
            }))
          : [],
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(mapped);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialSnapshot(JSON.stringify(mapped));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(defaultProduct);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialSnapshot(JSON.stringify(defaultProduct));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProduct, categories]);


  const handleFieldChange = (fields: any) => {
    setFormData((prev: any) => ({
      ...prev,
      ...fields,
    }));
  };

  const hasUnsavedChanges = JSON.stringify(formData) !== initialSnapshot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(formData);
      // Refresh initial snapshot on save success
      setInitialSnapshot(JSON.stringify(formData));
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData(JSON.parse(initialSnapshot));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24 relative">
      {/* Top Bar with actions */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/seller/products"
            className="grid size-10 place-items-center rounded-full border border-border/80 bg-card hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="size-4 text-muted-foreground" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              {initialProduct ? 'Edit Product' : 'Create Product'}
            </h1>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
              {initialProduct ? `ID: ${initialProduct.id.slice(0, 8)}...` : 'Product Catalog Management'}
            </span>
          </div>
        </div>

        {initialProduct && (
          <a
            href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001'}/product/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted/50 transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <Eye className="size-4" /> Preview Storefront
          </a>
        )}
      </div>

      {/* Validation alert banner */}
      {error && (
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-bold">Failed to Save changes</p>
            <p className="font-normal opacity-90 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Grid container layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Side: General, Pricing, Inventory, Media, Variants */}
        <div className="lg:col-span-2 space-y-6">
          <ProductGeneral formData={formData} onChange={handleFieldChange} brands={brands} />
          
          <ProductMedia formData={formData} onChange={handleFieldChange} />
          
          <ProductPricing formData={formData} onChange={handleFieldChange} />
          
          <ProductInventory formData={formData} onChange={handleFieldChange} />
          
          <ProductVariants formData={formData} onChange={handleFieldChange} />
        </div>

        {/* Right Side: Status, Organization, SEO */}
        <div className="space-y-6">
          <ProductPublishing formData={formData} onChange={handleFieldChange} />
          
          <ProductOrganization
            formData={formData}
            onChange={handleFieldChange}
            categories={categories}
            collections={collections}
          />
          
          <ProductSeo formData={formData} onChange={handleFieldChange} />
        </div>
      </div>

      {/* Unsaved changes floating bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-bottom duration-300">
          <div className="p-4 rounded-3xl border border-border bg-card shadow-float flex items-center justify-between gap-6 backdrop-blur-md bg-card/90">
            <span className="text-xs font-bold text-foreground pl-2 select-none">
              Unsaved changes
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDiscard}
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
