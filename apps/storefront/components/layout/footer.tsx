'use client'

import { ArrowRight, Camera, Play, Send, ShoppingBag, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Container } from '@corecart/ui'

const columns = [
  {
    title: 'Shop',
    links: ['New Arrivals', 'Best Sellers', 'Fashion', 'Technology', 'Home & Living', 'Sale'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Sustainability', 'Press', 'Affiliates'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Track Order', 'Returns', 'Shipping', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'],
  },
]

const socials = [
  { icon: Camera, label: 'Instagram' },
  { icon: Send, label: 'Twitter' },
  { icon: Users, label: 'Facebook' },
  { icon: Play, label: 'YouTube' },
]

const payments = ['VISA', 'MC', 'AMEX', 'PAYPAL', 'APPLE', 'GPAY']

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <Container className="py-16">
        {/* Newsletter */}
        <div className="flex flex-col gap-8 rounded-3xl bg-foreground p-8 text-background md:flex-row md:items-center md:justify-between md:p-12">
          <div className="max-w-md">
            <h2 className="font-serif text-3xl leading-tight text-balance">
              Join the EllipMart inner circle
            </h2>
            <p className="mt-2 text-sm text-background/70">
              Early access to drops, members-only pricing, and a little something for your first order.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email) setSubscribed(true)
            }}
            className="w-full max-w-sm"
          >
            {subscribed ? (
              <p className="rounded-full bg-background/10 px-5 py-4 text-center text-sm">
                Thanks for subscribing — check your inbox.
              </p>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-background/10 p-1.5 backdrop-blur">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm text-background outline-none placeholder:text-background/50"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="grid size-10 place-items-center rounded-full bg-background text-foreground transition-transform hover:scale-105 active:scale-95"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Columns */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
                <ShoppingBag className="size-4" />
              </span>
              <span className="text-xl font-semibold tracking-tight">EllipMart</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Elevated everyday commerce. Curated collections and luxury essentials, delivered with care.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-semibold">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="/category/all"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EllipMart Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            {payments.map((p) => (
              <span
                key={p}
                className="grid h-6 min-w-9 place-items-center rounded border border-border bg-background px-1.5 text-[9px] font-semibold text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
