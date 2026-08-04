'use client'

import { memo, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@corecart/ui'

const CountdownDigits = memo(function CountdownDigits({ target }: { target: number }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, target - now)
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)

  const units = [
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ]

  return (
    <div className="flex gap-4 lg:justify-end">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[84px] flex-col items-center rounded-[var(--radius-lg)] bg-background/10 px-4 py-5 backdrop-blur"
        >
          <span className="font-mono text-3xl font-semibold tabular-nums text-background sm:text-4xl">
            {String(u.value).padStart(2, '0')}
          </span>
          <span className="mt-1 text-xs uppercase tracking-widest text-background/60">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
})

export function PromoBanner() {
  const [target] = useState(() => Date.now() + 1000 * 60 * 60 * 8 + 1000 * 60 * 23)

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-foreground">
          <Image
            src="/images/hero-tech.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/30" />
          <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:p-16">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                Flash sale
              </span>
              <h2 className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-background sm:text-4xl lg:text-5xl">
                Up to 40% off premium tech essentials
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-background/70">
                Handpicked audio, wearables and smart home devices at their best
                prices of the season. Ends soon.
              </p>
              <Link
                href="/category/tech"
                className="mt-8 inline-flex h-12 items-center justify-center gap-1 rounded-full bg-background px-7 text-sm font-medium text-foreground transition-transform hover:scale-[1.02] active:scale-95"
              >
                Shop the sale
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>
            <CountdownDigits target={target} />
          </div>
        </div>
      </Container>
    </section>
  )
}
