'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Clock, Mic, Search, TrendingUp, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { products } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

import { motionPresets } from '@/lib/motion/presets'

export function SearchDialog({
  open,
  onClose,
  trendingSearches,
}: {
  open: boolean
  onClose: () => void
  trendingSearches: string[]
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(['Leather tote', 'Headphones'])
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60)
    else setQuery('')
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 5)
  }, [query])

  const submit = (term: string) => {
    if (!term.trim()) return
    setRecent((prev) => [term, ...prev.filter((r) => r !== term)].slice(0, 5))
    router.push(`/search?q=${encodeURIComponent(term)}`)
    onClose()
  }

  const startVoice = () => {
    setListening((v) => !v)
    // Voice recognition would connect to a speech API in production.
    setTimeout(() => setListening(false), 2500)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[8vh]"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={motionPresets.fadeIn}
        >
          <motion.div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={onClose}
            variants={motionPresets.fadeIn}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            variants={motionPresets.modal}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-popover shadow-float"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit(query)
              }}
              className="flex items-center gap-3 border-b border-border px-5 py-4"
            >
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={startVoice}
                aria-label="Search by voice"
                className={cn(
                  'grid size-9 place-items-center rounded-full transition-colors',
                  listening ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Mic className={cn('size-4', listening && 'animate-pulse')} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </form>

            <div className="max-h-[52vh] overflow-y-auto p-4">
              {results.length > 0 ? (
                <motion.div
                  variants={motionPresets.stagger(0.04)}
                  initial="initial"
                  animate="animate"
                  className="space-y-1"
                >
                  <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Products
                  </p>
                  {results.map((p) => (
                    <motion.button
                      variants={motionPresets.fadeUp}
                      key={p.id}
                      onClick={() => {
                        router.push(`/product/${p.slug}`)
                        onClose()
                      }}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={p.images[0] || '/placeholder.svg'} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(p.price, p.currency)}</span>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  variants={motionPresets.stagger(0.05)}
                  initial="initial"
                  animate="animate"
                  className="grid gap-6 sm:grid-cols-2"
                >
                  <motion.div variants={motionPresets.fadeUp}>
                    <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <TrendingUp className="size-3.5" /> Trending
                    </p>
                    <div className="flex flex-col">
                      {trendingSearches.map((t) => (
                        <button
                          key={t}
                          onClick={() => submit(t)}
                          className="flex items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
                        >
                          {t}
                          <ArrowUpRight className="size-3.5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div variants={motionPresets.fadeUp}>
                    <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Clock className="size-3.5" /> Recent
                    </p>
                    <div className="flex flex-col">
                      {recent.length === 0 && (
                        <p className="px-2 py-2 text-sm text-muted-foreground">No recent searches</p>
                      )}
                      {recent.map((t) => (
                        <button
                          key={t}
                          onClick={() => submit(t)}
                          className="flex items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
                        >
                          {t}
                          <ArrowUpRight className="size-3.5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
