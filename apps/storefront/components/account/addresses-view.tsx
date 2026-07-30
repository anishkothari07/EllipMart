'use client'

import { Check, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@corecart/shared'

export type Address = {
  id: string
  label: string
  name: string
  line1: string
  line2?: string | null
  city: string
  state: string
  zip: string
  country: string
  phone: string
  isDefault: boolean
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

export function AddressesView({ initialAddresses }: { initialAddresses: any[] }) {
  const [items, setItems] = useState<Address[]>(initialAddresses)
  const [editing, setEditing] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)

  const remove = (id: string) => setItems((prev) => prev.filter((a) => a.id !== id))
  const makeDefault = (id: string) =>
    setItems((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))

  const openNew = () => {
    setEditing(null)
    setShowForm(true)
  }
  const openEdit = (a: Address) => {
    setEditing(a)
    setShowForm(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Addresses</h1>
        <button
          onClick={openNew}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background"
        >
          <Plus className="size-4" /> Add address
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.length === 0 && !showForm && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-8 text-center">
            <MapPin className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">No addresses added</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first shipping or billing address.</p>
          </div>
        )}
        {items.map((a) => (
          <div
            key={a.id}
            className={cn(
              'flex flex-col rounded-2xl border bg-card p-5',
              a.isDefault ? 'border-foreground/40' : 'border-border',
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="size-4 text-accent" /> {a.label}
              </span>
              {a.isDefault && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                  Default
                </span>
              )}
            </div>
            <address className="flex-1 text-sm not-italic leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{a.name}</span>
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.state} {a.zip}
              <br />
              {a.phone}
            </address>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              {!a.isDefault && (
                <button
                  onClick={() => makeDefault(a.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Check className="size-3.5" /> Set default
                </button>
              )}
              <button
                onClick={() => openEdit(a)}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Pencil className="size-3.5" /> Edit
              </button>
              <button
                onClick={() => remove(a.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5" /> Delete
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
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-float">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Edit address' : 'Add address'}</h2>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label" defaultValue={editing?.label} placeholder="Home" />
                <Field label="Full name" defaultValue={editing?.name} placeholder="Your Name" />
              </div>
              <Field label="Address line 1" defaultValue={editing?.line1} placeholder="Street address" />
              <Field label="Address line 2" defaultValue={editing?.line2} placeholder="Apt, suite (optional)" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" defaultValue={editing?.city} />
                <Field label="State" defaultValue={editing?.state} />
                <Field label="ZIP" defaultValue={editing?.zip} />
              </div>
              <Field label="Phone" defaultValue={editing?.phone} type="tel" />
              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
                >
                  Save address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
