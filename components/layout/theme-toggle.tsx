'use client'

import { Palette } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { setThemeStudioOpen } = useTheme()
  return (
    <button
      type="button"
      onClick={() => setThemeStudioOpen(true)}
      aria-label="Open Theme Studio"
      className={cn(
        'grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted',
        className,
      )}
    >
      <Palette className="size-4" />
    </button>
  )
}

