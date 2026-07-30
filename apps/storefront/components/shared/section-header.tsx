import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  hrefLabel?: string
  align?: 'left' | 'center'
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = 'View all',
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
        align === 'center' ? 'sm:flex-col sm:items-center sm:text-center' : ''
      }`}
    >
      <div className={align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {eyebrow ? (
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-2 text-balance font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm font-medium text-foreground"
        >
          {hrefLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  )
}
