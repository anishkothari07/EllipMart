import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign in · EllipMart',
  description: 'Sign in to your EllipMart account.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const callbackUrl = typeof params.callbackUrl === 'string' ? params.callbackUrl : typeof params.redirect === 'string' ? params.redirect : ''
  const registerHref = callbackUrl ? `/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/register'

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue shopping and track your orders."
      footer={
        <>
          New to EllipMart?{' '}
          <Link href={registerHref} className="font-medium text-foreground hover:text-accent">
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
