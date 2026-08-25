'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { generateThemeVariables } from '@corecart/shared/src/theme/css-generator'
import { Theme } from '@corecart/shared/src/theme/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Heart, X, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@corecart/shared'

function ThemeCard({ theme, isActive, onSelect, isFavorite, onToggleFavorite }: { 
  theme: Theme, 
  isActive: boolean, 
  onSelect: () => void,
  isFavorite: boolean,
  onToggleFavorite: (e: React.MouseEvent) => void
}) {
  const vars = generateThemeVariables(theme)

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 cursor-pointer',
        isActive ? 'border-transparent scale-[1.02] shadow-lg' : 'border-border hover:border-primary/40 hover:shadow-md'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeThemeHighlight"
          className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none z-10"
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
      )}
      {/* Isolated Mini UI Preview */}
      <div 
        className="relative h-28 w-full p-3 pointer-events-none" 
        style={{ ...vars, backgroundColor: 'var(--background)' } as React.CSSProperties}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        
        {/* Mini Navbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-16 h-3 rounded-full" style={{ backgroundColor: 'var(--foreground)' }} />
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
            <div className="size-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
        </div>

        {/* Mini Product Card & Hero */}
        <div className="flex gap-2 h-full">
          {/* Hero Side */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="w-3/4 h-2.5 rounded-full" style={{ backgroundColor: 'var(--foreground)' }} />
            <div className="w-1/2 h-2 rounded-full" style={{ backgroundColor: 'var(--muted-foreground)' }} />
            <div className="mt-auto w-12 h-4 rounded-md" style={{ backgroundColor: 'var(--button)' }} />
          </div>
          
          {/* Card Side */}
          <div className="w-16 rounded-lg border p-1.5 flex flex-col gap-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-full h-8 rounded bg-muted overflow-hidden" style={{ backgroundColor: 'var(--muted)' }} />
            <div className="w-full h-1.5 rounded-full mt-1" style={{ backgroundColor: 'var(--foreground)' }} />
            <div className="w-2/3 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
        </div>
      </div>

      {/* Theme Info (Renders in global theme context, outside isolated block) */}
      <div className="flex items-center justify-between border-t border-border bg-card p-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{theme.name}</h4>
          <p className="text-[10px] text-muted-foreground line-clamp-1">{theme.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="size-3" />
            </motion.div>
          )}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(e)
            }}
            className="grid size-7 place-items-center rounded-full hover:bg-muted text-muted-foreground z-10"
          >
            <Heart className={cn("size-3.5 transition-colors", isFavorite && "fill-accent text-accent")} />
          </button>
        </div>
      </div>
    </div>
  )
}

function StorePreview() {
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground transition-colors duration-300">
      {/* Mock Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md transition-colors duration-300">
        <div className="text-xl font-serif font-bold tracking-tight">EllipMart</div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <span className="cursor-pointer hover:text-accent transition-colors duration-300">Shop</span>
          <span className="cursor-pointer hover:text-accent transition-colors duration-300">Collections</span>
          <span className="cursor-pointer hover:text-accent transition-colors duration-300">About</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="size-8 rounded-full bg-muted transition-colors duration-300" />
          <div className="flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-300 shadow-sm hover:opacity-90">
            Cart (2)
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
        {/* Mock Hero */}
        <section className="mb-12 flex flex-col items-center justify-center rounded-3xl bg-secondary py-20 text-center transition-colors duration-300">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-300 mb-6 shadow-sm">
            <Sparkles className="size-3 text-accent" /> New Arrival
          </div>
          <h1 className="mb-4 max-w-xl text-4xl font-serif font-medium tracking-tight text-secondary-foreground transition-colors duration-300">
            Experience Premium Design
          </h1>
          <p className="mb-8 max-w-md text-sm text-muted-foreground transition-colors duration-300">
            A beautiful, fully customizable storefront built with performance and elegance in mind.
          </p>
          <div className="flex items-center gap-4">
            <button className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-300 hover:opacity-90 shadow-soft">
              Shop Now
            </button>
            <button className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium transition-colors duration-300 hover:bg-muted shadow-soft">
              Learn More
            </button>
          </div>
        </section>

        {/* Mock Grid */}
        <h2 className="mb-6 text-2xl font-serif font-medium">Trending Products</h2>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-float">
              <div className="aspect-[4/3] bg-muted transition-colors duration-300" />
              <div className="flex flex-col p-5">
                <span className="text-xs uppercase tracking-wider text-muted-foreground transition-colors duration-300 mb-1">Category</span>
                <h3 className="text-base font-medium text-card-foreground transition-colors duration-300">Premium Item {i}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-accent transition-colors duration-300">₹9,999</span>
                  <button className="rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ThemeStudio() {
  const { themeStudioOpen, setThemeStudioOpen, themes, themeId, setTheme, favoriteThemes, toggleFavorite } = useTheme()
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(themes.map(t => t.category)))
    return ['Favorites', ...cats]
  }, [themes])

  const filteredThemes = useMemo(() => {
    return themes.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
  }, [themes, search])

  if (!themeStudioOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="relative flex h-full max-h-[900px] w-full max-w-[1400px] overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Close Button */}
          <button
            onClick={() => setThemeStudioOpen(false)}
            className="absolute right-6 top-6 z-50 grid size-10 place-items-center rounded-full bg-background/50 border border-border text-muted-foreground backdrop-blur-md hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>

          {/* Left Panel: Theme Selection */}
          <div className="flex w-full max-w-sm flex-col border-r border-border bg-muted/20">
            <div className="flex flex-col gap-4 p-6 border-b border-border bg-card/50">
              <div>
                <h2 className="text-xl font-serif font-medium">Theme Studio</h2>
                <p className="text-sm text-muted-foreground mt-1">Personalize your CoreCart experience</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search themes..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="flex flex-col gap-8">
                {categories.map(category => {
                  let categoryThemes = filteredThemes

                  if (category === 'Favorites') {
                    categoryThemes = filteredThemes.filter(t => favoriteThemes.includes(t.id))
                    if (categoryThemes.length === 0) return null
                  } else {
                    categoryThemes = filteredThemes.filter(t => t.category === category)
                    if (categoryThemes.length === 0) return null
                  }

                  return (
                    <div key={category}>
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {categoryThemes.map(theme => (
                          <ThemeCard 
                            key={`${category}-${theme.id}`} 
                            theme={theme} 
                            isActive={themeId === theme.id} 
                            onSelect={() => setTheme(theme.id)}
                            isFavorite={favoriteThemes.includes(theme.id)}
                            onToggleFavorite={(e) => {
                              toggleFavorite(theme.id)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
                {filteredThemes.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No themes found matching &quot;{search}&quot;
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Live Store Preview */}
          <div className="flex-1 overflow-hidden relative bg-background">
            <StorePreview />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
