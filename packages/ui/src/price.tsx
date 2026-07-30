import { cn } from '@corecart/shared'
import { formatPrice, discountPct } from '@corecart/shared'

export function Price({
  price,
  oldPrice,
  currency = 'INR',
  className,
  size = 'md',
}: {
  price: number
  oldPrice?: number
  currency?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-semibold text-foreground', sizes[size])}>
        {formatPrice(price, currency)}
      </span>
      {oldPrice && oldPrice > price && (
        <span
          className={cn(
            'text-muted-foreground line-through',
            size === 'lg' ? 'text-base' : 'text-xs',
          )}
        >
          {formatPrice(oldPrice, currency)}
        </span>
      )}
    </div>
  )
}
