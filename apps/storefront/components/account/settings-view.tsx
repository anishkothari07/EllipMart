'use client'

import { useState } from 'react'
import { cn } from '@corecart/shared'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-foreground' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

type Setting = { id: string; label: string; desc: string; value: boolean }

export function SettingsView() {
  const [notifications, setNotifications] = useState<Setting[]>([
    { id: 'orders', label: 'Order updates', desc: 'Shipping and delivery notifications', value: true },
    { id: 'promos', label: 'Promotions & offers', desc: 'Sales, discounts, and early access', value: true },
    { id: 'newsletter', label: 'Weekly newsletter', desc: 'Editor picks and new arrivals', value: false },
    { id: 'restock', label: 'Back in stock', desc: 'Alerts for items on your wishlist', value: true },
  ])

  const [privacy, setPrivacy] = useState<Setting[]>([
    { id: 'profile', label: 'Personalized recommendations', desc: 'Use my activity to tailor suggestions', value: true },
    { id: 'share', label: 'Share data with partners', desc: 'Allow trusted partners to improve offers', value: false },
  ])

  const toggle = (
    list: Setting[],
    setList: (s: Setting[]) => void,
    id: string,
  ) => setList(list.map((s) => (s.id === id ? { ...s, value: !s.value } : s)))

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl font-medium tracking-tight">Settings</h1>

      <section className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-medium">Notifications</h2>
          <p className="text-sm text-muted-foreground">Choose what updates you receive.</p>
        </div>
        <ul className="divide-y divide-border">
          {notifications.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Toggle checked={s.value} onChange={() => toggle(notifications, setNotifications, s.id)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-medium">Privacy</h2>
          <p className="text-sm text-muted-foreground">Control how your data is used.</p>
        </div>
        <ul className="divide-y divide-border">
          {privacy.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Toggle checked={s.value} onChange={() => toggle(privacy, setPrivacy, s.id)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-medium">Preferences</h2>
          <p className="text-sm text-muted-foreground">Regional and language settings.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Language</span>
            <select className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-foreground/30">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Français</option>
              <option>Español</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Currency</span>
            <select className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-foreground/30">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>CAD ($)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
        <h2 className="font-medium text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button className="mt-4 inline-flex h-10 items-center rounded-full border border-destructive/40 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-background">
          Delete account
        </button>
      </section>
    </div>
  )
}
