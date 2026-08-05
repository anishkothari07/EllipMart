'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { AuthField, PasswordField, SubmitButton } from './auth-fields'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Successful login -> Check for callback URL or default to account
      const callback = searchParams.get('callbackUrl') || '/account'
      router.push(callback)
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
        placeholder="Enter your password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={
          <Link href="/auth/forgot-password" className="font-medium text-accent hover:underline">
            Forgot?
          </Link>
        }
      />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" className="size-4 rounded accent-foreground" defaultChecked />
        Keep me signed in
      </label>
      <SubmitButton loading={loading}>Sign in</SubmitButton>

    </form>
  )
}
