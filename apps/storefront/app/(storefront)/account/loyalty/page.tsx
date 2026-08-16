export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import { LoyaltyView } from '@/components/account/loyalty-view'

export const metadata: Metadata = {
  title: 'Loyalty Points · EllipMart',
  description: 'Earn and redeem EllipMart loyalty points on every purchase.',
}

export default function LoyaltyPage() {
  return <LoyaltyView />
}
