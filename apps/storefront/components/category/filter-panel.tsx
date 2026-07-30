'use client'

import { Star } from 'lucide-react'
import { cn } from '@corecart/shared'
import { formatPrice } from '@corecart/shared'

export type Filters = {
  brands: string[]
  minRating: number
  inStockOnly: boolean
  maxPrice: number
}

export function FilterPanel({
  allBrands,
  priceCeiling,
  filters,
  onChange,
  onReset,
}: {
  allBrands: string[]
  priceCeiling: number
  filters: Filters
  onChange: (next: Filters) => void
  onReset: () => void
}) {
  const toggleBrand = (brand: string) => {
    onChange({
      ...filters,
      brands: filters.brands.includes(brand)
        ? filters.brands.filter((b) => b !== brand)
        : [...filters.brands, brand],
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Filters</h2>
        <button
          onClick={onReset}
          className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Reset all
        </button>
      </div>

      {/* Price */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price range
        </p>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[var(--accent)]"
          aria-label="Maximum price"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(0)}</span>
          <span className="font-medium text-foreground">Up to {formatPrice(filters.maxPrice)}</span>
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brand</p>
        <ul className="flex flex-col gap-2.5">
          {allBrands.map((brand) => (
            <li key={brand}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="size-4 rounded border-border accent-[var(--accent)]"
                />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Customer rating
        </p>
        <div className="flex flex-col gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                filters.minRating === r ? 'bg-muted font-medium' : 'hover:bg-muted',
              )}
            >
              <span className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-3.5',
                      i < r ? 'fill-accent text-accent' : 'text-muted-foreground/30',
                    )}
                  />
                ))}
              </span>
              &amp; up
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Availability
        </p>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="size-4 rounded border-border accent-[var(--accent)]"
          />
          In stock only
        </label>
      </div>
    </div>
  )
}
