'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PasswordField, SubmitButton } from './auth-fields'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mismatch = confirm.length > 0 && password !== confirm

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mismatch) return
    setError(null)
    setLoading(true)
    
    const email = localStorage.getItem('auth_reset_email')
    if (!email) {
      setError('Session expired. Please request a new reset link.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: '000000', // Mock OTP for backend validation
          newPassword: password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      localStorage.removeItem('auth_reset_email')
      router.push('/auth/login')
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
      <PasswordField
        label="New password"
        placeholder="Enter new password"
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordField
        label="Confirm password"
        placeholder="Re-enter new password"
        required
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {mismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
      <SubmitButton loading={loading} disabled={mismatch}>
        Reset password
      </SubmitButton>
    </form>
  )
}
