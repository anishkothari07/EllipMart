import { cn } from '@/lib/utils'

export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer relative overflow-hidden rounded-xl bg-muted',
        className,
      )}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Shimmer className="aspect-[4/5] rounded-2xl" />
      <div className="mt-3.5 flex flex-col gap-2">
        <Shimmer className="h-3 w-16 rounded-md" />
        <Shimmer className="h-4 w-3/4 rounded-md" />
        <Shimmer className="h-4 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
