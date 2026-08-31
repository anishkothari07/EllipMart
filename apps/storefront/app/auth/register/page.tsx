import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Create account · EllipMart',
  description: 'Join EllipMart for early access, faster checkout, and easy returns.',
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const callbackUrl = typeof params.callbackUrl === 'string' ? params.callbackUrl : typeof params.redirect === 'string' ? params.redirect : ''
  const loginHref = callbackUrl ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/login'

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join EllipMart for early access, faster checkout, and members-only perks."
      image="/images/hero-tech.png"
      footer={
        <>
          Already have an account?{' '}
          <Link href={loginHref} className="font-medium text-foreground hover:text-accent">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<div>Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  )
}
