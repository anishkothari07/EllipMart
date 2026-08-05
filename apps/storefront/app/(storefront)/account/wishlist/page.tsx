export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import { WishlistView } from '@/components/account/wishlist-view'

export const metadata: Metadata = {
  title: 'Wishlist · SmartGO',
  description: 'Products you have saved for later.',
}

export default function WishlistPage() {
  return <WishlistView />
}
