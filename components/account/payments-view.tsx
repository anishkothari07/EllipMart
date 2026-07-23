'use client'

import { Check, CreditCard, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
export type PaymentMethod = {
  id: string
  brand: 'Visa' | 'Mastercard' | 'Amex'
  last4: string
  expMonth: number
  expYear: number
  holder: string
  isDefault: boolean
}
import { cn } from '@/lib/utils'

const brandStyles: Record<PaymentMethod['brand'], string> = {
  Visa: 'from-[oklch(0.45_0.09_255)] to-[oklch(0.3_0.07_255)]',
  Mastercard: 'from-[oklch(0.4_0.06_40)] to-[oklch(0.28_0.05_30)]',
  Amex: 'from-[oklch(0.45_0.05_200)] to-[oklch(0.3_0.04_210)]',
}

function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-foreground/30"
      />
    </label>
  )
}

export function PaymentsView({ initialMethods = [] }: { initialMethods?: PaymentMethod[] }) {
  const [items, setItems] = useState<PaymentMethod[]>(initialMethods)
  const [showForm, setShowForm] = useState(false)

  const remove = (id: string) => setItems((prev) => prev.filter((m) => m.id !== id))
  const makeDefault = (id: string) =>
    setItems((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Payment methods</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background"
        >
          <Plus className="size-4" /> Add card
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {items.length === 0 && !showForm && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-8 text-center">
            <CreditCard className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">No payment methods</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a credit or debit card for faster checkout.</p>
          </div>
        )}
        {items.map((m) => (
          <div key={m.id} className="flex flex-col gap-3">
            <div
              className={cn(
                'relative flex aspect-[1.586/1] flex-col justify-between rounded-2xl bg-gradient-to-br p-5 text-background shadow-soft',
                brandStyles[m.brand],
              )}
            >
              <div className="flex items-center justify-between">
                <CreditCard className="size-7" />
                {m.isDefault && (
                  <span className="rounded-full bg-background/20 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
                    Default
                  </span>
                )}
              </div>
              <div>
                <p className="font-mono text-lg tracking-widest">•••• {m.last4}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wide opacity-80">{m.holder}</span>
                  <span className="opacity-80">
                    {String(m.expMonth).padStart(2, '0')}/{String(m.expYear).slice(-2)}
                  </span>
                </div>
              </div>
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold italic opacity-90">
                {m.brand}
              </span>
            </div>
            <div className="flex items-center gap-3 px-1">
              {!m.isDefault && (
                <button
                  onClick={() => makeDefault(m.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Check className="size-3.5" /> Set default
                </button>
              )}
              <button
                onClick={() => remove(m.id)}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-float">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add card</h2>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowForm(false)
              }}
              className="flex flex-col gap-4"
            >
              <Field label="Cardholder name" placeholder="Your Name" />
              <Field label="Card number" placeholder="1234 5678 9012 3456" inputMode="numeric" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiry" placeholder="MM / YY" />
                <Field label="CVC" placeholder="123" inputMode="numeric" />
              </div>
              <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                This is a demo. Do not enter real card details.
              </p>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
              >
                Save card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
