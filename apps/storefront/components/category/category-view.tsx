'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, List, PackageOpen, SlidersHorizontal, X } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { Category, Product } from '@corecart/types'
import { cn } from '@corecart/shared'
import { Container } from '@corecart/ui'
import { Breadcrumb } from '@corecart/ui'
import { ProductGrid } from '@/components/product/product-grid'
import { QuickView } from '@/components/product/quick-view'
import { EmptyState } from '@corecart/ui'
import { FilterPanel, type Filters } from './filter-panel'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'

const sortLabels: Record<SortKey, string> = {
  featured: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  rating: 'Top Rated',
  newest: 'Newest',
}

export function CategoryView({
  category,
  title,
  description,
  bannerImage,
  products,
}: {
  category?: Category
  title: string
  description?: string
  bannerImage: string
  products: Product[]
}) {
  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.price), 100) / 50) * 50,
    [products],
  )
  const allBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  )

  const defaultFilters: Filters = {
    brands: [],
    minRating: 0,
    inStockOnly: false,
    maxPrice: priceCeiling,
  }

  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [sort, setSort] = useState<SortKey>('featured')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [quickView, setQuickView] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false
      if (filters.minRating && p.rating < filters.minRating) return false
      if (filters.inStockOnly && !p.inStock) return false
      if (p.price > filters.maxPrice) return false
      return true
    })
    switch (sort) {
      case 'price-asc':
        return [...result].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...result].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating)
      case 'newest':
        return [...result].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew))
      default:
        return result
    }
  }, [products, filters, sort])

  const activeFilterCount =
    filters.brands.length +
    (filters.minRating ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.maxPrice < priceCeiling ? 1 : 0)

  return (
    <div className="pb-24">
      {/* Banner */}
      <section className="relative overflow-hidden bg-secondary/40">
        <div className="absolute inset-0">
          <Image
            src={bannerImage || '/placeholder.svg'}
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
          />
        </div>
        <Container className="relative py-14 sm:py-20">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/category/all' },
              { label: title },
            ]}
          />
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">{products.length} products</p>
        </Container>
      </section>

      <Container className="mt-10">
        <div className="flex gap-10">
          {/* Sidebar (desktop) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterPanel
                allBrands={allBrands}
                priceCeiling={priceCeiling}
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultFilters)}
              />
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium lg:hidden"
                >
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-foreground text-[10px] text-background">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Showing {filtered.length} of {products.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Sort products"
                    className="h-10 cursor-pointer appearance-none rounded-full border border-border bg-card pl-4 pr-9 text-sm font-medium outline-none transition-colors hover:border-foreground/20"
                  >
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                <div className="hidden items-center rounded-full border border-border p-1 sm:flex">
                  <button
                    onClick={() => setView('grid')}
                    aria-label="Grid view"
                    aria-pressed={view === 'grid'}
                    className={cn(
                      'grid size-8 place-items-center rounded-full transition-colors',
                      view === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground',
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    aria-label="List view"
                    aria-pressed={view === 'list'}
                    className={cn(
                      'grid size-8 place-items-center rounded-full transition-colors',
                      view === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground',
                    )}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {filtered.length > 0 ? (
              <ProductGrid products={filtered} view={view} onQuickView={setQuickView} />
            ) : (
              <EmptyState
                icon={PackageOpen}
                title="No products match your filters"
                description="Try adjusting or resetting your filters to see more of our collection."
              />
            )}
          </div>
        </div>
      </Container>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial="c"
            animate="o"
            exit="c"
          >
            <motion.div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
              variants={{ o: { opacity: 1 }, c: { opacity: 0 } }}
            />
            <motion.aside
              className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-background shadow-float"
              variants={{ o: { x: 0 }, c: { x: '-100%' } }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="text-base font-semibold">Filters</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="grid size-9 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanel
                  allBrands={allBrands}
                  priceCeiling={priceCeiling}
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                />
              </div>
              <div className="border-t border-border p-5">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
                >
                  Show {filtered.length} results
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
