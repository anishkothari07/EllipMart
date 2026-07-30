'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CategoryFormProps {
  initialCategory?: any; // Undefined when creating new
  allFlatCategories: { id: string; name: string }[];
  onSave: (data: any) => Promise<void>;
}

export function CategoryForm({ initialCategory, allFlatCategories, onSave }: CategoryFormProps) {
  const router = useRouter();

  const defaultCategory = {
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true,
    sortOrder: 0,
    seo: { title: '', description: '' },
  };

  const [formData, setFormData] = useState<any>(defaultCategory);
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) {
      const mapped = {
        name: initialCategory.name || '',
        slug: initialCategory.slug || '',
        description: initialCategory.description || '',
        parentId: initialCategory.parentId || '',
        isActive: initialCategory.isActive !== undefined ? initialCategory.isActive : true,
        sortOrder: initialCategory.sortOrder || 0,
        seo: {
          title: initialCategory.seo?.title || '',
          description: initialCategory.seo?.description || '',
        },
      };
      setFormData(mapped);
      setInitialSnapshot(JSON.stringify(mapped));
    } else {
      setFormData(defaultProductWithDefaultSort());
      setInitialSnapshot(JSON.stringify(defaultProductWithDefaultSort()));
    }
  }, [initialCategory]);

  const defaultProductWithDefaultSort = () => {
    return {
      ...defaultCategory,
      sortOrder: allFlatCategories.length,
    };
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-');
    setFormData((prev: any) => ({ ...prev, name, slug }));
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
      router.push('/categories');
    } catch (err: any) {
      setError(err.message || 'Failed to save category details.');
    } finally {
      setSaving(false);
    }
  };

  // Exclude current category ID from parent selections
  const potentialParents = allFlatCategories.filter(
    (c) => !initialCategory || c.id !== initialCategory.id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24 relative animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="grid size-10 place-items-center rounded-full border border-border/80 bg-card hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="size-4 text-muted-foreground" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              {initialCategory ? 'Edit Category' : 'Create Category'}
            </h1>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-0.5">
              Category Organization Details
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-bold">Failed to Save Category</p>
            <p className="font-normal opacity-90 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left column: basic inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground">General Information</h3>

            <div className="grid gap-5">
              {/* Category Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Watches"
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
                  placeholder="e.g. smart-watches"
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
                  placeholder="Brief summary of this category catalog groupings..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData((p: any) => ({ ...p, description: e.target.value }))}
                  className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors resize-none"
                />
              </div>
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
                  placeholder={formData.name || 'e.g. Smart Watches online'}
                  value={formData.seo?.title || ''}
                  onChange={(e) => handleSeoChange('title', e.target.value)}
                  className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SEO Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Meta description displayed in search indexes..."
                  value={formData.seo?.description || ''}
                  onChange={(e) => handleSeoChange('description', e.target.value)}
                  className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: status and nesting parent selectors */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Category Relations</h3>

            <div className="grid gap-5">
              {/* Parent Category select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Parent Category</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData((p: any) => ({ ...p, parentId: e.target.value || '' }))}
                  className="h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-medium outline-none focus:border-foreground/30 transition-colors cursor-pointer"
                >
                  <option value="">No Parent (Root Category)</option>
                  {potentialParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status checkbox */}
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p: any) => ({ ...p, isActive: e.target.checked }))}
                  className="size-4 rounded border-border accent-foreground"
                />
                Category is Active & Visible
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
