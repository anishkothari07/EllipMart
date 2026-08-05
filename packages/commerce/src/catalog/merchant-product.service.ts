import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';
import type { Prisma } from '@prisma/client';

export interface MerchantProductListItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  visibility: string;
  updatedAt: Date;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  sku: string; // SKU of the first variant or default
  price: number; // selling price of the first variant or default
  inventory: number; // total stock across all variants
  thumbnail: string | null;
}

export class MerchantProductService {
  static async listMerchantProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    sort?: string;
  }): Promise<{
    items: MerchantProductListItem[];
    total: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { shortDescription: { contains: params.search } },
        { slug: { contains: params.search } },
        { variants: { some: { sku: { contains: params.search } } } },
      ];
    }

    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.brandId) where.brandId = params.brandId;
    if (params.status) where.status = params.status;

    let orderBy: any = { updatedAt: 'desc' };
    if (params.sort) {
      const [field, dir] = params.sort.split('_');
      orderBy = { [field]: dir };
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          brand: true,
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
            include: { media: true },
          },
          variants: {
            where: { deletedAt: null },
            include: {
              inventory: true,
              pricing: true,
            },
          },
        },
      }),
    ]);

    const items: MerchantProductListItem[] = products.map((p) => {
      const firstVariant = p.variants[0];
      const sku = firstVariant?.sku || 'N/A';
      // Price comes from the variant's ProductPrice record
      const price = firstVariant?.pricing
        ? Number((firstVariant.pricing as any).sellingPrice?.toString() || 0)
        : 0;
      
      // Calculate total stock across all variants
      const inventory = p.variants.reduce((acc, v) => {
        return acc + (v.inventory?.quantityAvailable || 0);
      }, 0);

      const thumbnail = p.images?.[0]?.media?.publicUrl || null;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status as any,
        visibility: p.visibility as any,
        updatedAt: p.updatedAt,
        category: p.category ? { id: p.category.id, name: p.category.name } : null,
        brand: p.brand ? { id: p.brand.id, name: p.brand.name } : null,
        sku,
        price,
        inventory,
        thumbnail,
      };
    });

    return { items, total };
  }

  static async getMerchantProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seo: true,
        category: true,
        brand: true,
        variants: {
          where: { deletedAt: null },
          include: {
            inventory: true,
            pricing: true,
            attributes: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' as const },
          include: {
            media: true,
          },
        },
        collections: {
          include: {
            collection: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!product || product.deletedAt) {
      throw new AppError('Product not found or deleted', 404);
    }

    return product;
  }

  static async createMerchantProduct(input: any) {
    // Check if slug is unique
    const existing = await prisma.product.findUnique({
      where: { slug: input.slug },
    });
    if (existing) {
      throw new AppError('Product with this URL slug already exists', 400);
    }

    const {
      brandId,
      categoryId,
      name,
      slug,
      shortDescription,
      longDescription,
      status,
      visibility,
      price,
      inventory,
      sku,
      barcode,
      variants,
      seo,
      collectionIds,
      tags,
      images,
    } = input;

    // Use transaction to create product, variants, inventory, SEO, and tags
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          slug,
          shortDescription,
          longDescription: longDescription || '',
          status: status || 'DRAFT',
          visibility: visibility || 'PUBLIC',
          brand: brandId ? { connect: { id: brandId } } : undefined,
          category: { connect: { id: categoryId } },
          seo: seo ? { create: seo } : undefined,
        },
      });

      // Tags association
      if (tags && tags.length > 0) {
        for (const rawTag of tags) {
          if (!rawTag) continue;
          const tName = typeof rawTag === 'string' ? rawTag : (rawTag.name || rawTag.label || String(rawTag));
          if (!tName || typeof tName !== 'string') continue;

          const tSlug = tName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          if (!tSlug) continue;

          const tag = await tx.tag.upsert({
            where: { slug: tSlug },
            update: {},
            create: { name: tName, slug: tSlug },
          });

          await tx.productTag.create({
            data: {
              productId: product.id,
              tagId: tag.id,
            },
          });
        }
      }

      // Collections association
      if (collectionIds && collectionIds.length > 0) {
        for (const colId of collectionIds) {
          const cId = typeof colId === 'string' ? colId : colId?.id;
          if (!cId) continue;
          await tx.collectionProduct.create({
            data: {
              productId: product.id,
              collectionId: cId,
            },
          });
        }
      }

      // Product Images association
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imgPath = typeof images[i] === 'string' ? images[i] : images[i]?.url || images[i]?.path;
          if (!imgPath) continue;
          let cleanPath = imgPath;
          if (typeof imgPath === 'string' && (imgPath.startsWith('http://') || imgPath.startsWith('https://'))) {
            try {
              const urlObj = new URL(imgPath);
              cleanPath = urlObj.pathname;
            } catch (e) {}
          }
          const media = await tx.media.findFirst({
            where: {
              OR: [
                { path: imgPath },
                { publicUrl: imgPath },
                { path: cleanPath },
                { publicUrl: cleanPath }
              ]
            },
          });
          if (media) {
            await tx.productImage.create({
              data: {
                productId: product.id,
                mediaId: media.id,
                isPrimary: i === 0,
                sortOrder: i,
              },
            });
          }
        }
      }

      // Create variants
      if (variants && variants.length > 0) {
        for (const v of variants) {
          const newVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: v.sku || `SKU-${slug.toUpperCase()}-${Math.floor(Math.random()*1000)}`,
              name: v.name || 'Variant',
              isActive: true,
            },
          });

          // Inventory record
          await tx.inventory.create({
            data: {
              variantId: newVariant.id,
              quantityAvailable: v.quantity || v.stock || 0,
              status: (v.quantity || v.stock || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            },
          });

          // Price record for variant
          const vSelling = Number(v.price?.sellingPrice || v.price || price?.sellingPrice || 0);
          const vMrp = Number(v.price?.mrp || price?.mrp || vSelling);
          await tx.productPrice.create({
            data: {
              productVariantId: newVariant.id,
              mrp: vMrp,
              sellingPrice: vSelling,
              costPrice: v.price?.costPrice ? Number(v.price.costPrice) : null,
              currency: 'INR',
            },
          });
        }
      } else {
        // Create single default variant if no custom variants are built
        const defaultVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: sku || `SKU-${slug.toUpperCase()}`,
            name: 'Default Variant',
            isActive: true,
          },
        });

        await tx.inventory.create({
          data: {
            variantId: defaultVariant.id,
            quantityAvailable: inventory?.quantity || 0,
            status: (inventory?.quantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
          },
        });

        // Create price record for default variant
        if (price) {
          await tx.productPrice.upsert({
            where: { productVariantId: defaultVariant.id },
            update: {
              mrp: price.mrp || price.sellingPrice || 0,
              sellingPrice: price.sellingPrice || 0,
              costPrice: price.costPrice ? price.costPrice : null,
            },
            create: {
              productVariantId: defaultVariant.id,
              mrp: price.mrp || price.sellingPrice || 0,
              sellingPrice: price.sellingPrice || 0,
              costPrice: price.costPrice ? price.costPrice : null,
            },
          });
        }
      }

      return product;
    }, { timeout: 30000 });
  }

  static async updateMerchantProduct(id: string, input: any) {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new AppError('Product not found', 404);

    const {
      brandId,
      categoryId,
      name,
      slug,
      shortDescription,
      longDescription,
      status,
      visibility,
      price,
      inventory,
      sku,
      barcode,
      variants,
      seo,
      collectionIds,
      tags,
      images,
    } = input;

    // Check slug unique
    if (slug && slug !== product.slug) {
      const existing = await prisma.product.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new AppError('Product with this URL slug already exists', 400);
      }
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update basic fields on the Product model
      await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          shortDescription,
          longDescription: longDescription || '',
          status,
          visibility,
          brand: brandId ? { connect: { id: brandId } } : { disconnect: true },
          category: categoryId ? { connect: { id: categoryId } } : undefined,
        },
      });

      // 1b. Update price on the default variant's ProductPrice record
      if (price) {
        const existingVariantsForPrice = await tx.productVariant.findMany({
          where: { productId: id, deletedAt: null },
          take: 1,
        });
        if (existingVariantsForPrice.length > 0) {
          const firstVar = existingVariantsForPrice[0];
          await tx.productPrice.upsert({
            where: { productVariantId: firstVar.id },
            update: {
              mrp: price.mrp || price.sellingPrice || 0,
              sellingPrice: price.sellingPrice || 0,
              costPrice: price.costPrice ? price.costPrice : null,
            },
            create: {
              productVariantId: firstVar.id,
              mrp: price.mrp || price.sellingPrice || 0,
              sellingPrice: price.sellingPrice || 0,
              costPrice: price.costPrice ? price.costPrice : null,
            },
          });
        }
      }

      // 2. Update SEO
      if (seo) {
        await tx.productSeo.upsert({
          where: { productId: id },
          update: seo,
          create: { productId: id, ...seo },
        });
      }

      // 3. Update Tags
      if (tags !== undefined) {
        await tx.productTag.deleteMany({ where: { productId: id } });
        for (const tName of tags) {
          const tSlug = tName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const tag = await tx.tag.upsert({
            where: { slug: tSlug },
            update: {},
            create: { name: tName, slug: tSlug },
          });
          await tx.productTag.create({
            data: { productId: id, tagId: tag.id },
          });
        }
      }

      // 4. Update Collections
      if (collectionIds !== undefined) {
        await tx.collectionProduct.deleteMany({ where: { productId: id } });
        for (const colId of collectionIds) {
          await tx.collectionProduct.create({
            data: { productId: id, collectionId: colId },
          });
        }
      }

      // 4b. Sync Product Images
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        for (let i = 0; i < images.length; i++) {
          const imgPath = images[i];
          if (!imgPath) continue;
          let cleanPath = imgPath;
          if (typeof imgPath === 'string' && (imgPath.startsWith('http://') || imgPath.startsWith('https://'))) {
            try {
              const urlObj = new URL(imgPath);
              cleanPath = urlObj.pathname;
            } catch (e) {}
          }
          const media = await tx.media.findFirst({
            where: {
              OR: [
                { path: imgPath },
                { publicUrl: imgPath },
                { path: cleanPath },
                { publicUrl: cleanPath }
              ]
            },
          });
          if (media) {
            await tx.productImage.create({
              data: {
                productId: id,
                mediaId: media.id,
                isPrimary: i === 0,
                sortOrder: i,
              },
            });
          }
          // If no media record found (external URL pasted directly), skip silently
        }
      }

      // 5. Update variants
      if (variants && variants.length > 0) {
        // Archive or delete existing variants that are NOT in the incoming variants payload
        const incomingIds = variants.map((v: any) => v.id).filter(Boolean);
        await tx.productVariant.updateMany({
          where: {
            productId: id,
            id: { notIn: incomingIds },
          },
          data: {
            deletedAt: new Date(),
            isActive: false,
          },
        });

        for (const v of variants) {
          if (v.id) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sku: v.sku,
                name: v.name,
              },
            });

            await tx.inventory.upsert({
              where: { variantId: v.id },
              update: {
                quantityAvailable: v.quantity || 0,
                status: (v.quantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
              },
              create: {
                variantId: v.id,
                quantityAvailable: v.quantity || 0,
                status: (v.quantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
              },
            });
          } else {
            // Create new variant
            const newVar = await tx.productVariant.create({
              data: {
                productId: id,
                sku: v.sku,
                name: v.name,
                isActive: true,
              },
            });

            await tx.inventory.create({
              data: {
                variantId: newVar.id,
                quantityAvailable: v.quantity || 0,
                status: (v.quantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
              },
            });
          }
        }
      } else {
        // Default single variant updates
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id, deletedAt: null },
        });

        if (existingVariants.length === 1) {
          const v = existingVariants[0];
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: sku || v.sku,
            },
          });

          await tx.inventory.upsert({
            where: { variantId: v.id },
            update: {
              quantityAvailable: inventory?.quantity || 0,
              status: (inventory?.quantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            },
            create: {
              variantId: v.id,
              quantityAvailable: inventory?.quantity || 0,
              status: (inventory?.quantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            },
          });
        }
      }
    });
  }

  static async deleteMerchantProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async bulkUpdateStatus(ids: string[], status: 'ACTIVE' | 'ARCHIVED') {
    return prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  static async bulkDelete(ids: string[]) {
    return prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  }
}
