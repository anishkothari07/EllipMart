import { Container } from '@corecart/ui'

export default function Loading() {
  return (
    <Container className="py-10 animate-pulse">
      {/* Banner Skeleton */}
      <div className="relative aspect-[21/9] w-full rounded-3xl bg-muted mb-8" />
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[4/5] w-full rounded-2xl bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    </Container>
  )
}
