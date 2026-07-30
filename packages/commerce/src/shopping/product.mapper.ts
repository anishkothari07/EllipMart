import { Product as UIProduct, ProductVariant, Review } from '@corecart/types';
import { products as mockProducts } from '@corecart/shared';

export function mapProductToUI(
  product: any, // Fully hydrated Prisma product
  currency: string, // Always passed by caller from manifest.settings.defaultCurrency
): UIProduct {
  // Aggregate specifications
  const specifications = product.specifications?.map((s: any) => ({
    label: s.name,
    value: s.value,
  })) || [];

  // Group variants into UI structure
  const variantMap = new Map<string, ProductVariant>();
  
  if (product.variants) {
    for (const v of product.variants) {
      const type = v.name.toLowerCase().includes('size') ? 'size' : 'color'; // Fallback logic or map by proper variant types
      // In a real system, we'd have explicit Variant Option Groups linked to attributes
      
      // Let's rely on productAttributes instead if we have them
      // Assuming product.productAttributes contains COLOR / SIZE mappings
    }
  }

  // Handle images — resolve through media relation
  // Canonical path: ProductImage → Media → path (or publicUrl as fallback)
  const images = product.images
    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    .map((img: any) => {
      let src = img.media?.publicUrl || img.media?.path || null;
      if (typeof src === 'string' && src.startsWith('/uploads/')) {
        src = `http://localhost:3002${src}`;
      }
      return src;
    })
    .filter(Boolean) || [];

  if (images.length === 0) {
    // Fallback to mock images to preserve the premium UI animations during development
    const charCode = product.id ? product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1) : 0;
    const mockProduct = mockProducts[charCode % mockProducts.length];
    if (mockProduct && mockProduct.images) {
      images.push(...mockProduct.images);
    } else {
      images.push('/images/p-headphones.png', '/images/p-earbuds.png');
    }
  }

  // Price from first active variant's pricing
  const firstVariant = product.variants?.[0];
  const sellingPrice = Number(firstVariant?.pricing?.sellingPrice || 0);
  const mrp = firstVariant?.pricing?.mrp ? Number(firstVariant.pricing.mrp) : undefined;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name || '',
    category: product.category?.slug || '',
    price: sellingPrice,
    oldPrice: mrp && mrp > sellingPrice ? mrp : undefined,
    currency,
    rating: product.ratingAverage || 0,
    reviewCount: product.reviewCount || 0,
    images,
    colors: [], // Extract from attributes
    badge: product.tags?.map((t: any) => t.tag.name)[0], // Use first tag as badge for now
    inStock: product.variants?.some((v: any) => (v.inventory?.quantityAvailable || 0) > 0) || false,
    stockCount: product.variants?.reduce((sum: number, v: any) => sum + (v.inventory?.quantityAvailable || 0), 0) || 0,
    freeDelivery: sellingPrice > 999, // Business rule: free delivery over ₹999
    isNew: product.tags?.some((t: any) => t.tag.slug === 'new') || false,
    isBestSeller: product.salesCount > 100,
    description: product.shortDescription || product.longDescription,
    highlights: [],
    specifications,
    variants: [], // To be populated properly below or by service
    rawVariants: product.variants?.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: Number(v.pricing?.sellingPrice || 0),
      inStock: (v.inventory?.quantityAvailable || 0) > 0,
    })) || [],
    reviews: product.reviews?.map((r: any): Review => ({
      id: r.id,
      author: r.user?.firstName ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous',
      avatar: r.user?.avatar?.url,
      rating: r.rating,
      date: r.createdAt.toISOString(),
      title: r.title || '',
      body: r.comment || '',
      verified: r.isVerified,
      helpful: r.helpfulVotes,
    })) || [],
  };
}

