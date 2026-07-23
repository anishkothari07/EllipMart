'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthField, SubmitButton } from './auth-fields'

export function ForgotPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }
      
      // Store email for reset password form
      localStorage.setItem('auth_reset_email', email);
      router.push('/auth/reset-password');
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
      <SubmitButton loading={loading}>Send reset link</SubmitButton>
    </form>
  )
}
