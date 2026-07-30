import type { Metadata } from 'next'
import { AddressesView } from '@/components/account/addresses-view'

export const metadata: Metadata = {
  title: 'Addresses · SmartGO',
  description: 'Manage your shipping and billing addresses.',
}

import { getCurrentUser } from '@corecart/shared/src/auth'
import { prisma } from '@corecart/database'
import { redirect } from 'next/navigation'

export default async function AddressesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  // Convert dates to string for client component
  const serializedAddresses = addresses.map(addr => ({
    ...addr,
    createdAt: addr.createdAt.toISOString(),
    updatedAt: addr.updatedAt.toISOString(),
  }))

  return <AddressesView initialAddresses={serializedAddresses} />
}
