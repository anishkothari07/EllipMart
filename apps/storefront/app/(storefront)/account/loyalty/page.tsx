export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import { LoyaltyView } from '@/components/account/loyalty-view'

export const metadata: Metadata = {
  title: 'Loyalty Points · SmartGO',
  description: 'Earn and redeem SmartGO loyalty points on every purchase.',
}

export default function LoyaltyPage() {
  return <LoyaltyView />
}
