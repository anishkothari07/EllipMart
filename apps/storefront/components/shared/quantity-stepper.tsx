'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@corecart/shared'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center rounded-full border border-border', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
