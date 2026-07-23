import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchView } from '@/components/search/search-view'
import { Container } from '@/components/shared/container'
import { ProductGridSkeleton } from '@/components/shared/skeletons'

export const metadata: Metadata = {
  title: 'Search — SmartGO',
  description: 'Search across the full SmartGO catalog.',
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-10">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-lg bg-muted" />
          <ProductGridSkeleton count={10} />
        </Container>
      }
    >
      <SearchView />
    </Suspense>
  )
}
