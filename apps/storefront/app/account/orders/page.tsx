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
                  images: {
                    include: { media: true },
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  }
                }
              }
            }
          }
        }
      },
      payment: true,
      timeline: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  // Convert Date objects to strings for serialization to Client Component
  const serializedOrders = orders.map((o: typeof orders[number]) => ({
    ...o,
    subTotal: o.subTotal.toString(),
    discountTotal: o.discountTotal.toString(),
    taxTotal: o.taxTotal.toString(),
    shippingTotal: o.shippingTotal.toString(),
    grandTotal: o.grandTotal.toString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    // Serialize payment for client use
    paymentMethodCode: o.payment?.paymentMethodCode ?? null,
    paymentStatus: o.payment?.status ?? null,
    lines: o.items.map((l: any) => ({
      ...l,
      unitPrice: l.unitPrice?.toString(),
      discount: l.discount?.toString(),
      tax: l.tax?.toString(),
      totalPrice: l.totalPrice?.toString(),
      product: {
        ...(l.variant?.product || {}),
        name: l.variant?.product?.name || l.productName || 'Unknown Product',
        imagePath: l.variant?.product?.images?.[0]?.media?.publicUrl
          || l.variant?.product?.images?.[0]?.media?.path
          || null,
      }
    }))
  }))

  return <OrdersView initialOrders={serializedOrders} />
}
