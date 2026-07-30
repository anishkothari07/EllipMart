'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@corecart/shared'

export function AuthField({
  label,
  className,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: React.ReactNode }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        {hint}
      </span>
      <input
        {...props}
        className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-foreground/30"
      />
    </label>
  )
}

export function PasswordField({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        {hint}
      </span>
      <span className="relative flex items-center">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className="h-11 w-full rounded-xl border border-border bg-background px-3.5 pr-11 text-sm outline-none transition-colors focus:border-foreground/30"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </span>
    </label>
  )
}

export function SubmitButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-background/40 border-t-background" />
      ) : (
        children
      )}
    </button>
  )
}
