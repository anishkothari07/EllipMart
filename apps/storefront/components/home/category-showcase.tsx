// Server Component — no 'use client' needed for static category grid
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@corecart/ui'
import { SectionHeader } from '@corecart/ui'
import { categories } from '@corecart/shared'

export function CategoryShowcase() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeader
          eyebrow="Shop by category"
          title="Curated collections for every corner of your life"
          href="/category/all"
        />
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <div
              key={cat.slug}
              className={i === 0 ? 'col-span-2 lg:col-span-2 lg:row-span-2' : ''}
            >
              <Link
                href={`/category/${cat.slug}`}
                prefetch={false}
                className="group relative block h-full overflow-hidden rounded-[var(--radius-lg)] bg-muted"
              >
                <div
                  className={`relative w-full ${
                    i === 0 ? 'aspect-[16/10] lg:aspect-auto lg:h-full' : 'aspect-[4/3]'
                  }`}
                >
                  <Image
                    src={cat.image || '/placeholder.svg'}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-background sm:text-2xl">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-sm text-background/80">
                      {cat.productCount} products
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-full bg-background/20 text-background backdrop-blur transition group-hover:bg-background group-hover:text-foreground">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
