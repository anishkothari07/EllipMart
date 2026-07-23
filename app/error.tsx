'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Home, RotateCcw, TriangleAlert } from 'lucide-react'
import { Container } from '@/components/shared/container'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.log('[v0] App error boundary:', error.message)
  }, [error])

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-destructive/10">
        <TriangleAlert className="size-8 text-destructive" />
      </span>
      <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-balance">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        An unexpected error occurred while loading this page. You can try again or head back home.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95"
        >
          <RotateCcw className="size-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Home className="size-4" /> Back home
        </Link>
      </div>
    </Container>
  )
}
