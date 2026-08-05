import { Container } from '@corecart/ui'

export default function Loading() {
  return (
    <Container className="py-12 animate-pulse">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery skeleton */}
        <div className="aspect-[4/5] w-full rounded-2xl bg-muted" />
        
        {/* Buy box skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-10 w-3/4 rounded bg-muted" />
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-8 w-40 rounded bg-muted" />
          <div className="h-24 w-full rounded-2xl bg-muted" />
          <div className="h-12 w-full rounded-full bg-muted mt-4" />
        </div>
      </div>
    </Container>
  )
}
