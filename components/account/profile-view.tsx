'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
        className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-foreground/30 disabled:opacity-60"
      />
    </label>
  )
}

export function ProfileView({ user }: { user: any }) {
  const [saved, setSaved] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl font-medium tracking-tight">Profile</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <span className="grid size-16 place-items-center rounded-full bg-foreground text-xl font-semibold text-background">
          {user?.firstName?.[0] || ''}
          {user?.lastName?.[0] || ''}
        </span>
        <div>
          <p className="text-lg font-medium">
            {user?.firstName || ''} {user?.lastName || ''}
          </p>
          <p className="text-sm text-muted-foreground">
            {user?.role || 'User'} · 0 points · Member since{' '}
            {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" defaultValue={user?.firstName || ''} />
          <Field label="Last name" defaultValue={user?.lastName || ''} />
        </div>
        <Field label="Email address" type="email" defaultValue={user?.email || ''} />
        <Field label="Phone number" type="tel" defaultValue={user?.phone || ''} />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Bio</span>
          <textarea
            rows={3}
            placeholder="Tell us a little about yourself"
            className="rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-foreground/30"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
          >
            Save changes
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <Check className="size-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
