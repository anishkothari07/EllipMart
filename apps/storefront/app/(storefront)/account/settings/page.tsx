export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import { SettingsView } from '@/components/account/settings-view'

export const metadata: Metadata = {
  title: 'Settings · EllipMart',
  description: 'Manage notifications, privacy, and preferences.',
}

export default function SettingsPage() {
  return <SettingsView />
}
