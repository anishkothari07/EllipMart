import type { Metadata } from 'next'
import { CategoryView } from '@/components/category/category-view'
import { shoppingProductService } from '@corecart/commerce'
import { prisma } from '@corecart/database'

const specialTitles: Record<string, { title: string; description: string; image: string }> = {
  all: {
    title: 'All Products',
    description: 'Explore the full SmartGO collection across every category.',
    image: '/images/cat-fashion.png',
  },
  sale: {
    title: 'Sale',
    description: 'Limited-time reductions on our most-loved pieces. Up to 60% off.',
    image: '/images/cat-accessories.png',
  },
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'The latest drops across fashion, tech, home and beauty.',
    image: '/images/cat-tech.png',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  const title = category?.name ?? specialTitles[slug]?.title ?? 'Shop'
  return {
    title: `${title} — SmartGO`,
    description: category?.description ?? specialTitles[slug]?.description,
  }
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug }, include: { banner: true } })
  const special = specialTitles[slug]
  
  // Call the real service
  // If special slug like 'all', we don't pass category filter
  // If 'sale' or 'new-arrivals', we could pass tags or specific filters. 
  // For now, if it's not a special slug, pass as category filter
  const filterParams: any = { limit: 50 };
  if (!specialTitles[slug]) {
    filterParams.category = slug;
  } else if (slug === 'new-arrivals') {
    filterParams.sort = 'newest';
  }

  const result = await shoppingProductService.listProducts(filterParams);
  const products = result.items;

  const title = category?.name ?? special?.title ?? 'Shop'
  const description = category?.description ?? special?.description
  const bannerImage = category?.banner?.path ?? special?.image ?? '/images/cat-fashion.png'

  return (
    <CategoryView
      category={category || undefined}
      title={title}
      description={description}
      bannerImage={bannerImage}
      products={products}
    />
  )
}

