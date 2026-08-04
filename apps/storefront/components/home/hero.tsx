'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@corecart/ui'
import { heroSlides } from '@corecart/shared'

export function Hero() {
  const [index, setIndex] = useState(0)
  const [slides, setSlides] = useState<any[]>(heroSlides)
  const [activeCampaign, setActiveCampaign] = useState<any>(null)
  const count = slides.length

  const go = useCallback(
    (dir: number) => setIndex((i) => (dir + i + count) % count),
    [count],
  )

  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch('/api/v1/festivals').catch(() => null)
        if (!res || !res.ok) return
        const json = await res.json().catch(() => null)
        if (json && json.success && json.data) {
          const campaign = json.data
          setActiveCampaign(campaign)
          
          let bannerTxt = "Happy Diwali! Extra 10% instant discount on major cards."
          try {
            if (campaign.themeJson) {
              const theme = JSON.parse(campaign.themeJson)
              if (theme.bannerText) bannerTxt = theme.bannerText
            }
          } catch(e) {}

          const festSlide = {
            id: campaign.code || 'festival',
            eyebrow: '✨ FESTIVAL OF LIGHTS SPECIAL ✨',
            title: campaign.name || 'Great Diwali Sale',
            subtitle: bannerTxt,
            image: '/images/hero-home.png',
            ctaLabel: 'Explore Diwali Deals',
            ctaHref: '/category/all',
            align: 'left',
            theme: 'dark',
          }
          setSlides([festSlide, ...heroSlides])
        }
      } catch (e) {
        console.error("Campaign loading failure:", e)
      }
    }
    loadCampaign()
  }, [])

  useEffect(() => {
    if (count === 0) return
    const t = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setIndex((i) => (i + 1) % count)
      }
    }, 6000)
    return () => clearInterval(t)
  }, [count])

  const slide = slides[index] || heroSlides[0]

  return (
    <section className="relative">
      {activeCampaign && (
        <div className="w-full bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white py-2.5 px-4 text-center text-xs font-semibold tracking-wide shadow-md flex items-center justify-center gap-2">
          <span>✨🪔</span>
          <span>{activeCampaign.name} is LIVE! Diwali deals on select models!</span>
          <span>🪔✨</span>
        </div>
      )}
      <Container className="pt-4">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-muted">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[21/9]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image || '/placeholder.svg'}
                  alt={slide.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent dark:from-background/90 dark:via-background/50" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center">
              <Container className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="max-w-xl"
                  >
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
                      {slide.eyebrow}
                    </span>
                    <h1 className="mt-4 text-balance font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {slide.subtitle}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <Link
                        href={slide.ctaHref}
                        className="group inline-flex h-12 items-center justify-center gap-1 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95"
                      >
                        {slide.ctaLabel}
                        <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link
                        href="/category/all"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-border/70 bg-background/50 px-7 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
                      >
                        Explore all
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Container>
            </div>

            <div className="absolute bottom-5 right-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground backdrop-blur transition hover:bg-background"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground backdrop-blur transition hover:bg-background"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-8 bg-foreground' : 'w-2.5 bg-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
