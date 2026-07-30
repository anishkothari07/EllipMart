import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@corecart/shared'

export type Crumb = { label: string; href?: string }

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 text-muted-foreground/60" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
