'use client'

import { Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { cn } from '@corecart/shared'
import { AuthField, PasswordField, SubmitButton } from './auth-fields'

const rules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v: string) => /[0-9]/.test(v) },
]

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = useMemo(() => rules.filter((r) => r.test(password)).length, [password])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store email just in case we need it later, but skip OTP flow
      localStorage.setItem('auth_email', email);
      // Auto-login successful, redirect to callbackUrl or home
      const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect');
      const destination = callbackUrl || data.data?.redirectTo || '/';
      router.push(destination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <AuthField 
          label="First name" 
          placeholder="Jane" 
          required 
          autoComplete="given-name" 
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <AuthField 
          label="Last name" 
          placeholder="Doe" 
          required 
          autoComplete="family-name" 
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <AuthField 
        label="Email address" 
        type="email" 
        placeholder="you@example.com" 
        required 
        autoComplete="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordField
        label="Password"
        placeholder="Create a password"
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          {rules.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < strength ? 'bg-success' : 'bg-muted',
              )}
            />
          ))}
        </div>
        <ul className="mt-1 grid gap-1">
          {rules.map((r) => {
            const ok = r.test(password)
            return (
              <li
                key={r.label}
                className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-success' : 'text-muted-foreground')}
              >
                <Check className={cn('size-3.5', !ok && 'opacity-30')} /> {r.label}
              </li>
            )
          })}
        </ul>
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" required className="mt-0.5 size-4 rounded accent-foreground" />
        <span>
          I agree to the <span className="font-medium text-foreground underline">Terms of Service</span> and{' '}
          <span className="font-medium text-foreground underline">Privacy Policy</span>.
        </span>
      </label>

      <SubmitButton loading={loading}>Create account</SubmitButton>
    </form>
  )
}
