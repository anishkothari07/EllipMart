import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Create account · SmartGO',
  description: 'Join SmartGO for early access, faster checkout, and easy returns.',
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join SmartGO for early access, faster checkout, and members-only perks."
      image="/images/hero-tech.png"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-foreground hover:text-accent">
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
