import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../packages/database/src/index';

async function debugAdminProducts() {
  console.log('Fetching recent products in Railway Database...\n');
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      brand: true,
      variants: {
        include: {
          pricing: true,
          inventory: true
        }
      },
      images: {
        include: {
          media: true
        }
      }
    }
  });

  console.log(`Found ${products.length} products total.\n`);
  products.forEach((p, idx) => {
    console.log(`--- [Product #${idx + 1}] ---`);
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Status: ${p.status}`);
    console.log(`Visibility: ${p.visibility}`);
    console.log(`Category: ${p.category?.name} (${p.categoryId})`);
    console.log(`Brand: ${p.brand?.name} (${p.brandId})`);
    console.log(`Variants count: ${p.variants.length}`);
    p.variants.forEach((v, vIdx) => {
      console.log(`  Variant #${vIdx + 1}: SKU: ${v.sku}, SellingPrice: ${v.pricing?.sellingPrice}, Stock: ${v.inventory?.quantityAvailable}`);
    });
    console.log(`Images count: ${p.images.length}`);
    p.images.forEach((img, iIdx) => {
      console.log(`  Image #${iIdx + 1}: Path: ${img.media?.path}, URL: ${img.media?.publicUrl}`);
    });
    console.log('');
  });
}

debugAdminProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
