'use client'

import { SearchX } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { categories, trendingSearches } from '@corecart/shared'
import type { Product } from '@corecart/types'
import { Container } from '@corecart/ui'
import { ProductGrid } from '@/components/product/product-grid'
import { QuickView } from '@/components/product/quick-view'

export function SearchView() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [results, setResults] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [hasDirectMatches, setHasDirectMatches] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults([])
      setRecommendations([])
      setHasDirectMatches(true)
      return
    }
    setLoading(true)
    fetch(`/api/v1/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setResults(res.data.products || [])
          setRecommendations(res.data.recommendations || [])
          setHasDirectMatches(res.data.hasDirectMatches ?? true)
        } else {
          setResults([])
          setRecommendations([])
          setHasDirectMatches(true)
        }
      })
      .catch((err) => {
        console.error(err)
        setResults([])
        setRecommendations([])
        setHasDirectMatches(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [query])

  return (
    <Container className="py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Search results for</p>
        <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          &ldquo;{query}&rdquo;
        </h1>
        {loading ? (
          <p className="mt-2 text-sm text-muted-foreground animate-pulse">Searching catalog...</p>
        ) : !hasDirectMatches && recommendations.length > 0 ? (
          <p className="mt-2 text-sm font-medium text-amber-600">
            No exact matches for &ldquo;{query}&rdquo;
          </p>
        ) : hasDirectMatches && results.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
        ) : null}
      </div>

      {!loading && hasDirectMatches && results.length > 0 ? (
        <ProductGrid products={results} onQuickView={setQuickView} />
      ) : !loading && !hasDirectMatches && recommendations.length > 0 ? (
        <div className="mt-8">
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-400">
              We couldn&apos;t find an exact match
            </h2>
            <p className="mt-1 text-sm text-amber-600/80 dark:text-amber-500/80">
              But you might like these recommendations.
            </p>
          </div>
          <ProductGrid products={recommendations} onQuickView={setQuickView} />
        </div>
      ) : !loading ? (
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
      ) : null}

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </Container>
  )
}
