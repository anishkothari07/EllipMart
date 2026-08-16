import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Set new password · EllipMart',
  description: 'Choose a new password for your EllipMart account.',
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      image="/images/hero-home.png"
      footer={
        <>
          Back to{' '}
          <Link href="/auth/login" className="font-medium text-foreground hover:text-accent">
            sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
