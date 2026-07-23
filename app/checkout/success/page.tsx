import type { Metadata } from 'next'
import { OrderSuccess } from '@/components/checkout/order-success'

export const metadata: Metadata = {
  title: 'Order confirmed · SmartGO',
  description: 'Your order has been placed successfully.',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams
  return <OrderSuccess orderId={order ?? 'CC-000000'} />
}
