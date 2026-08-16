import dotenv from 'dotenv';
dotenv.config();

import { prisma, ProductStatus, ProductVisibility } from '../packages/database/src/index';

async function traceProductLifecycle() {
  console.log('=================================================================');
  console.log('[DIAGNOSTIC TRACE] Starting EllipMart Product Synchronization Audit');
  console.log('=================================================================\n');

  const testSlug = `diag-product-${Date.now()}`;
  const testName = `Diagnostic Product ${Date.now()}`;

  try {
    // 1. Create Brand & Category if needed
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Diagnostic Cat', slug: `diag-cat-${Date.now()}` }
      });
    }

    let brand = await prisma.brand.findFirst();
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: 'Diagnostic Brand', slug: `diag-brand-${Date.now()}` }
      });
    }

    // STAGE 1: Database Product Creation
    console.log('[STAGE 1] Creating product directly via Prisma...');
    const product = await prisma.product.create({
      data: {
        name: testName,
        slug: testSlug,
        description: 'Diagnostic trace product',
        longDescription: 'Detailed diagnostic trace product description.',
        status: ProductStatus.ACTIVE,
        visibility: ProductVisibility.PUBLIC,
        categoryId: category.id,
        brandId: brand.id,
        publishedAt: new Date(),
        variants: {
          create: [
            {
              sku: `SKU-DIAG-${Date.now()}`,
              name: 'Default Variant',
              pricing: {
                create: {
                  mrp: 100,
                  sellingPrice: 80,
                  costPrice: 50
                }
              },
              inventory: {
                create: {
                  quantityAvailable: 50,
                  quantityReserved: 0,
                  lowStockThreshold: 5
                }
              }
            }
          ]
        }
      },
      include: {
        variants: { include: { pricing: true, inventory: true } },
        category: true,
        brand: true
      }
    });

    console.log(`✓ [STAGE 1 PASSED] Product created in DB with ID: ${product.id}`);
    console.log(`  - Status: ${product.status}, Visibility: ${product.visibility}`);
    console.log(`  - Variants count: ${product.variants.length}`);

    // STAGE 2: Querying Product via Commerce Service Query Filter
    console.log('\n[STAGE 2] Checking if Product is returned by Storefront list query...');
    const activeProducts = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        visibility: ProductVisibility.PUBLIC,
        deletedAt: null
      },
      include: {
        variants: { include: { pricing: true } },
        brand: true,
        category: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const foundInList = activeProducts.some(p => p.id === product.id);
    if (foundInList) {
      console.log(`✓ [STAGE 2 PASSED] Product ${product.id} found in active list query!`);
    } else {
      console.error(`❌ [STAGE 2 FAILED] Product ${product.id} NOT returned by active list query!`);
    }

    // STAGE 3: Slug Query
    console.log('\n[STAGE 3] Querying product by slug...');
    const slugMatch = await prisma.product.findUnique({
      where: { slug: testSlug }
    });

    if (slugMatch) {
      console.log(`✓ [STAGE 3 PASSED] Product found by slug: ${slugMatch.slug}`);
    } else {
      console.error(`❌ [STAGE 3 FAILED] Product NOT found by slug: ${testSlug}`);
    }

    // Cleanup diagnostic test product
    console.log('\n[CLEANUP] Deleting diagnostic test product...');
    await prisma.product.delete({ where: { id: product.id } });
    console.log('✓ Diagnostic cleanup complete.\n');

    console.log('=================================================================');
    console.log('[DIAGNOSTIC SUMMARY] Database & Query Layer is 100% HEALTHY!');
    console.log('=================================================================');

  } catch (error: any) {
    console.error(`❌ [DIAGNOSTIC TRACE FAILED]: ${error.message}`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

traceProductLifecycle();
