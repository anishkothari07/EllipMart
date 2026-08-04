import dotenv from 'dotenv';
dotenv.config();

import { MerchantProductService } from '../packages/commerce/src/catalog/merchant-product.service';
import { ShoppingProductService } from '../packages/commerce/src/shopping/shopping-product.service';
import { prisma } from '../packages/database/src/index';

async function verifyProductSync() {
  console.log('=================================================================');
  console.log('[SYNC VERIFICATION] Testing Merchant -> Storefront Product Sync');
  console.log('=================================================================\n');

  const timestamp = Date.now();
  const testSlug = `sync-test-product-${timestamp}`;
  const testName = `Sync Test Item ${timestamp}`;

  try {
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Sync Category', slug: `sync-cat-${timestamp}` }
      });
    }

    let brand = await prisma.brand.findFirst();
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: 'Sync Brand', slug: `sync-brand-${timestamp}` }
      });
    }

    // 1. Merchant creates product
    console.log('[STEP 1] Merchant creates product...');
    const createdProduct = await MerchantProductService.createMerchantProduct({
      name: testName,
      slug: testSlug,
      shortDescription: 'Product created from merchant portal',
      longDescription: 'Full detailed description of sync test item.',
      categoryId: category.id,
      brandId: brand.id,
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      price: { mrp: 150, sellingPrice: 120, costPrice: 90 },
      inventory: { quantity: 25, lowStockThreshold: 5 },
      sku: `SKU-SYNC-${timestamp}`,
      barcode: `${timestamp}`
    });

    console.log(`✓ [STEP 1 PASSED] Product created with ID: ${createdProduct.id}`);

    // 2. Storefront fetches products list
    console.log('\n[STEP 2] Storefront ShoppingProductService queries active products...');
    const shoppingService = new ShoppingProductService();
    const storefrontList = await shoppingService.listProducts({ sort: 'newest', limit: 20 });

    const foundInStorefront = storefrontList.items.some(p => p.id === createdProduct.id);
    if (foundInStorefront) {
      console.log(`✓ [STEP 2 PASSED] Storefront list service returned newly created product!`);
    } else {
      throw new Error(`[STEP 2 FAILED] Product ${createdProduct.id} was not returned by Storefront listProducts()!`);
    }

    // 3. Storefront search query
    console.log('\n[STEP 3] Storefront queries search index...');
    const searchResults = await shoppingService.listProducts({ search: `Sync Test Item ${timestamp}` });
    const foundInSearch = searchResults.items.some(p => p.id === createdProduct.id);
    if (foundInSearch) {
      console.log(`✓ [STEP 3 PASSED] Search returned newly created product!`);
    } else {
      throw new Error(`[STEP 3 FAILED] Search did not return newly created product!`);
    }

    // Cleanup
    console.log('\n[CLEANUP] Cleaning up test product...');
    await MerchantProductService.deleteMerchantProduct(createdProduct.id);
    console.log('✓ Cleanup complete.\n');

    console.log('=================================================================');
    console.log('SUCCESS: Product synchronization between Merchant & Storefront is 100% VERIFIED!');
    console.log('=================================================================');

  } catch (error: any) {
    console.error(`❌ [VERIFICATION FAILED]: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProductSync();
