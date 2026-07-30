import type { Metadata } from 'next'
import { ProfileView } from '@/components/account/profile-view'

export const metadata: Metadata = {
  title: 'Profile · SmartGO',
  description: 'Manage your personal information.',
}

import { getCurrentUser } from '@corecart/shared/src/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  
  return <ProfileView user={user} />
}
