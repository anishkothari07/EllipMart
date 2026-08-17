import { internyxService } from '@corecart/commerce';
import { ProductCard } from '@/components/product/product-card';
import { Container } from '@corecart/ui';

export const metadata = {
  title: 'Internyx Rewards | EllipMart',
  description: 'Exclusive rewards catalog from Internyx.',
};

export const revalidate = 0; // Disable cache for testing

export default async function InternyxCatalogPage() {
  const internyxProducts = await internyxService.fetchProducts();

  return (
    <main className="min-h-screen pb-16 pt-8 md:pt-12">
      <Container>
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Internyx Rewards
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Browse and redeem your exclusive Internyx points for premium products.
            All products listed here are fetched live from the Internyx catalog.
          </p>
        </div>

        {internyxProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No products available at the moment. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {internyxProducts.map((p) => {
              // Map InternyxProduct to the frontend Product type expected by ProductCard
              const baseUrl = process.env.INTERNYX_BASE_URL || '';
              const fixUrl = (url: string | null) => {
                if (!url) return null;
                return url.startsWith('/') ? `${baseUrl}${url}` : url;
              };

              const rawImages = p.imageUrls?.length > 0 ? p.imageUrls : [p.imageUrl];
              const fixedImages = rawImages.map(fixUrl).filter(Boolean);

              const mappedProduct = {
                id: p.id,
                name: p.name,
                slug: `internyx-${p.id}`,
                images: fixedImages.length > 0 ? fixedImages : ['/placeholder.svg'],
                inStock: p.inStock,
                brand: 'Internyx',
                rating: 0,
                reviewCount: 0,
                price: p.priceInRupees,
                currency: 'INR',
                badge: 'Rewards',
              } as any; // Cast as any to bypass strict UI typing for this custom integration

              return <ProductCard key={p.id} product={mappedProduct} />;
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
