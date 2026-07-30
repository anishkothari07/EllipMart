import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign in · SmartGO',
  description: 'Sign in to your SmartGO account.',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue shopping and track your orders."
      footer={
        <>
          New to SmartGO?{' '}
          <Link href="/auth/register" className="font-medium text-foreground hover:text-accent">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
