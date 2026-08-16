import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign in · EllipMart',
  description: 'Sign in to your EllipMart account.',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue shopping and track your orders."
      footer={
        <>
          New to EllipMart?{' '}
          <Link href="/auth/register" className="font-medium text-foreground hover:text-accent">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div>Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
