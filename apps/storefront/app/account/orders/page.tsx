import type { Metadata } from 'next'
import { OrdersView } from '@/components/account/orders-view'

export const metadata: Metadata = {
  title: 'Orders · SmartGO',
  description: 'View and track all of your SmartGO orders.',
}

import { getCurrentUser } from '@corecart/shared/src/auth'
import { prisma } from '@corecart/database'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      }
    }
  })

  // Convert Date objects to strings for serialization to Client Component
  const serializedOrders = orders.map(o => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    lines: o.items.map((l: any) => ({
      ...l,
      product: {
        ...(l.variant?.product || {}),
        name: l.variant?.product?.name || l.productName || 'Unknown Product',
        images: l.variant?.product?.images?.map((img: any) => ({ ...img, createdAt: img.createdAt.toISOString(), updatedAt: img.updatedAt.toISOString() })) || []
      }
    }))
  }))

  return <OrdersView initialOrders={serializedOrders} />
}
