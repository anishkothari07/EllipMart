import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { Container } from '@corecart/ui'

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-serif text-[7rem] font-medium leading-none tracking-tight text-accent sm:text-[9rem]">
        404
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-balance">
        This page has wandered off
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you
        back to the good stuff.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Home className="size-4" /> Back home
        </Link>
        <Link
          href="/category/all"
          className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Search className="size-4" /> Browse products
        </Link>
      </div>
    </Container>
  )
}
