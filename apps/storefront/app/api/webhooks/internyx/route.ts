import { NextRequest } from 'next/server';
import { prisma } from '@corecart/database';
import { successResponse, errorResponse } from '@corecart/shared';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify API Key Header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.INTERNYX_API_KEY) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', undefined, 401);
    }

    const payload = await req.json();
    const { event, data } = payload;
    
    // We expect data to be shaped like:
    // { id, name, description, imageUrl, priceInRupees, inStock, category }

    switch (event) {
      case 'product.created':
      case 'product.updated':
        console.log(`[Sync] Product updated/created: ${data.name} (₹${data.priceInRupees})`);
        
        // Find or create category (naive string match)
        let category = await prisma.category.findUnique({ where: { slug: 'internyx-rewards' } });
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: 'Internyx Rewards',
              slug: 'internyx-rewards',
              description: 'Products synced from Internyx',
              sortOrder: 0,
            }
          });
        }

        // Find or create Brand
        let brand = await prisma.brand.findUnique({ where: { slug: 'internyx' } });
        if (!brand) {
          brand = await prisma.brand.create({
            data: { name: 'Internyx', slug: 'internyx' }
          });
        }

        const slug = `internyx-${data.id.toLowerCase()}`;
        
        // Create or update the product
        const product = await prisma.product.upsert({
          where: { slug },
          update: {
            name: data.name,
            longDescription: data.description || '',
            categoryId: category.id,
            brandId: brand.id,
            status: data.inStock ? 'ACTIVE' : 'OUT_OF_STOCK',
            // Update default variant price if needed, simplified for this integration
          },
          create: {
            name: data.name,
            slug,
            longDescription: data.description || '',
            categoryId: category.id,
            brandId: brand.id,
            status: data.inStock ? 'ACTIVE' : 'OUT_OF_STOCK',
            visibility: 'PUBLIC',
            variants: {
              create: {
                sku: `INT-${data.id}`,
                name: 'Default',
                pricing: {
                  create: {
                    basePrice: data.priceInRupees,
                    sellingPrice: data.priceInRupees,
                  }
                },
                inventory: {
                  create: {
                    quantityAvailable: data.inStock ? 100 : 0,
                  }
                }
              }
            }
          }
        });
        break;

      case 'product.deleted':
        console.log(`[Sync] Product removed: ${data.id}`);
        await prisma.product.update({
          where: { slug: `internyx-${data.id.toLowerCase()}` },
          data: { status: 'ARCHIVED' } // Soft delete
        }).catch(() => {}); // Ignore if doesn't exist
        break;
    }

    return successResponse({ received: true });
  } catch (error: any) {
    console.error('[WEBHOOK ERROR]', error);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
