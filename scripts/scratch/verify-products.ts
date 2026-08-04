import { prisma } from './packages/database/src/index';

async function main() {
    console.log("Connecting to Prisma...");
    const products = await prisma.product.findMany({
        include: {
            images: true
        }
    });

    console.log(`Found ${products.length} products.`);
    
    if (products.length > 0) {
        console.log("Latest Product:");
        const latest = products[products.length - 1];
        console.log(`- ID: ${latest.id}`);
        console.log(`- Title: ${latest.title}`);
        console.log(`- Slug: ${latest.slug}`);
        console.log(`- Price: ${latest.price}`);
        console.log(`- Media: ${latest.images?.map((m: any) => m.url || m.publicUrl).join(', ')}`);
        
        // Also verify storefront shopping mapper logic indirectly
        const hasLiveProducts = products.some(p => p.status === 'ACTIVE');
        console.log(`Has ACTIVE products: ${hasLiveProducts}`);
    } else {
        console.log("No products found in the database. Ensure merchant DB is seeded.");
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
