import { Star } from 'lucide-react'
import { cn } from '@corecart/shared'

export function StarRating({
  rating,
  size = 14,
  className,
  showValue = false,
}: {
  rating: number
  size?: number
  className?: string
  showValue?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, rating - i))
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                className="absolute inset-0 text-muted-foreground/30"
                style={{ width: size, height: size }}
                strokeWidth={1.5}
              />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="fill-accent text-accent"
                  style={{ width: size, height: size }}
                  strokeWidth={1.5}
                />
              </span>
            </span>
          )
        })}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
      )}
      <span className="sr-only">{`Rated ${rating} out of 5`}</span>
    </div>
  )
}
