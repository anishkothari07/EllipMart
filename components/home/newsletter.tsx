'use client'

import { useState } from 'react'
import { Check, Mail } from 'lucide-react'
import { Container } from '@/components/shared/container'
import { Button } from '@/components/ui/button'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setDone(true)
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-border/60 bg-card px-6 py-12 text-center shadow-[var(--shadow-soft)] sm:px-12">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-6" />
          </span>
          <h2 className="mt-5 text-balance font-serif text-3xl font-medium tracking-tight text-foreground">
            Get 10% off your first order
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Join the SmartGO list for early access to drops, private sales and
            styling notes. No spam, unsubscribe anytime.
          </p>
          {done ? (
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-3 text-sm font-medium text-primary">
              <Check className="size-4" />
              You&apos;re in. Check your inbox for your code.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" size="lg" className="h-12 rounded-full px-7">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  )
}
