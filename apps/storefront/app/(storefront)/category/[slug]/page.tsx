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
  try {
    const category = await prisma.category.findUnique({ where: { slug } })
    const title = category?.name ?? specialTitles[slug]?.title ?? 'Shop'
    return {
      title: `${title} — SmartGO`,
      description: category?.description ?? specialTitles[slug]?.description,
    }
  } catch {
    const title = specialTitles[slug]?.title ?? 'Shop'
    return { title: `${title} — SmartGO` }
  }
}

// Statically revalidate category pages occasionally to keep performance high
export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let category: any = null;
  let products: any[] = [];

  try {
    const [cat, result] = await Promise.all([
      prisma.category.findUnique({ where: { slug }, include: { banner: true } }),
      shoppingProductService.listProducts({
        limit: 24,
        ...(specialTitles[slug] === undefined ? { category: slug } : {}),
        ...(slug === 'new-arrivals' ? { sort: 'newest' } : {}),
      }),
    ]);
    category = cat;
    products = result.items;
  } catch (err) {
    console.error('[CategoryPage] DB unavailable:', (err as Error).message);
  }

  const special = specialTitles[slug];
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
