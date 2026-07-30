import type { Metadata } from 'next'
import { CheckoutView } from '@/components/checkout/checkout-view'

export const metadata: Metadata = {
  title: 'Checkout · SmartGO',
  description: 'Complete your purchase securely.',
}

export default function CheckoutPage() {
  return <CheckoutView />
}
