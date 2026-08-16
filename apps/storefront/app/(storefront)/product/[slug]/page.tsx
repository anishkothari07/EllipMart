import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product/product-detail'
import { shoppingProductService } from '@corecart/commerce'
import { recommendationService } from '@corecart/commerce'

// We cannot use generateStaticParams easily if we rely heavily on DB without caching or limiting, 
// but for now we can omit it or generate top 100 products.
// Let's remove it to default to dynamic or SSR for now.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await shoppingProductService.getProductBySlug(slug)
    return {
      title: `${product.name} — EllipMart`,
      description: product.description,
      openGraph: { images: product.images.slice(0, 1) },
    }
  } catch (e) {
    return { title: 'Product not found — EllipMart' }
  }
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let product;
  try {
    product = await shoppingProductService.getProductBySlug(slug)
  } catch (e) {
    notFound()
  }

  const related = await recommendationService.getRecommendations({
    type: 'similar',
    productId: product.id,
    categoryId: product.category,
    limit: 4,
  });

  const categoryName = product.category || 'Shop' // The mapper returns category slug

  return <ProductDetail product={product} related={related} categoryName={categoryName} />
}
