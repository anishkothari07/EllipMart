'use client'

import { SearchX } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { products, categories, trendingSearches } from '@/lib/data'
import type { Product } from '@/lib/types'
import { Container } from '@/components/shared/container'
import { ProductGrid } from '@/components/product/product-grid'
import { QuickView } from '@/components/product/quick-view'

export function SearchView() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const [quickView, setQuickView] = useState<Product | null>(null)

  const results = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <Container className="py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Search results for</p>
        <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          &ldquo;{query}&rdquo;
        </h1>
        {results.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <ProductGrid products={results} onQuickView={setQuickView} />
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-muted">
            <SearchX className="size-9 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="mt-5 text-xl font-semibold">No results found</h2>
          <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            We couldn&apos;t find anything matching your search. Try a different term or explore our
            categories below.
          </p>

          <div className="mt-8 w-full max-w-lg">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Popular searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {trendingSearches.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-foreground/30"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 w-full max-w-lg">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Browse categories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="rounded-full bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/70"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </Container>
  )
}
