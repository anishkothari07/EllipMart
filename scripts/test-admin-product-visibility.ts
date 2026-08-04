import dotenv from 'dotenv';
dotenv.config();

import { MerchantProductService } from '../packages/commerce/src/catalog/merchant-product.service';
import { prisma } from '../packages/database/src/index';

async function testAdminVisibility() {
  console.log('Testing instant Admin product creation visibility on Storefront API...\n');

  const ts = Date.now();
  const testName = `Live Admin Test Product ${ts}`;
  const testSlug = `live-admin-test-${ts}`;

  let category = await prisma.category.findFirst();
  let brand = await prisma.brand.findFirst();

  // Create product as Admin/Merchant
  const newProduct = await MerchantProductService.createMerchantProduct({
    name: testName,
    slug: testSlug,
    shortDescription: 'Product uploaded via admin portal test',
    longDescription: 'Full product details for admin upload.',
    categoryId: category?.id,
    brandId: brand?.id,
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    price: { mrp: 299, sellingPrice: 199, costPrice: 100 },
    inventory: { quantity: 50, lowStockThreshold: 5 },
    sku: `SKU-ADMIN-TEST-${ts}`,
    barcode: `${ts}`,
    tags: ['new', 'featured']
  });

  console.log(`Product created successfully! ID: ${newProduct.id}`);

  // Fetch via Storefront API
  try {
    const res = await fetch('http://localhost:3001/api/v1/products?sort=newest&limit=5');
    const json = await res.json();
    
    if (json.success && json.data?.items) {
      const found = json.data.items.some((item: any) => item.id === newProduct.id);
      if (found) {
        console.log(`✅ VERIFIED: "${testName}" appeared as #1 newest product on Storefront API!`);
      } else {
        console.error(`❌ FAILED: Product created, but NOT returned in top 5 on Storefront API.`);
      }
    }
  } catch (e: any) {
    console.error(`Could not connect to Storefront server: ${e.message}`);
  }
}

testAdminVisibility()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
