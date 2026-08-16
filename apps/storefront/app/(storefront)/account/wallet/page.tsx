export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import { WalletView } from '@/components/account/wallet-view'

export const metadata: Metadata = {
  title: 'My Wallet · EllipMart',
  description: 'Manage your EllipMart wallet balance and view transaction history.',
}

export default function WalletPage() {
  return <WalletView />
}
