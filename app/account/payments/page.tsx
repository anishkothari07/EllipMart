import type { Metadata } from 'next'
import { PaymentsView } from '@/components/account/payments-view'

export const metadata: Metadata = {
  title: 'Payment methods · SmartGO',
  description: 'Manage your saved cards and payment methods.',
}

import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PaymentsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  return <PaymentsView initialMethods={[]} />
}
