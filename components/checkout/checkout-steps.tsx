'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = ['Information', 'Shipping', 'Payment', 'Review'] as const

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Checkout progress">
      {steps.map((label, i) => {
        const status = i < current ? 'complete' : i === current ? 'current' : 'upcoming'
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  status === 'complete' && 'border-primary bg-primary text-primary-foreground',
                  status === 'current' && 'border-primary text-primary',
                  status === 'upcoming' && 'border-border text-muted-foreground',
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {status === 'complete' ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {label}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1 transition-colors',
                  i < current ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
