import type { Metadata } from 'next'
import { CartView } from '@/components/cart/cart-view'

export const metadata: Metadata = {
  title: 'Your Cart · SmartGO',
  description: 'Review the items in your shopping cart and proceed to checkout.',
}

export default function CartPage() {
  return <CartView />
}
