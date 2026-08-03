import { prisma } from '@corecart/database';
import { collectionRepository } from './collection.repository';
import { AppError } from '@corecart/shared';
import type { Prisma } from '@prisma/client';

export class MerchantCollectionService {
  static async listCollections(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CollectionWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const [total, items] = await prisma.$transaction([
      prisma.collection.count({ where }),
      prisma.collection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    return { items, total };
  }

  static async getCollection(id: string) {
    const col = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!col) {
      throw new AppError('Collection not found', 404);
    }

    return col;
  }

  static async createCollection(input: any) {
    const { name, slug, description, isAutomatic, rules, isActive, productIds } = input;

    // Check slug uniqueness
    const existing = await prisma.collection.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError('Collection with this URL slug already exists', 400);
    }

    return prisma.$transaction(async (tx) => {
      const col = await tx.collection.create({
        data: {
          name,
          slug,
          description,
          isAutomatic: isAutomatic || false,
          rules: rules ? JSON.stringify(rules) : null,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      // Insert manual product assignments if manual type and items are checked
      if (!isAutomatic && productIds && productIds.length > 0) {
        for (let i = 0; i < productIds.length; i++) {
          await tx.collectionProduct.create({
            data: {
              collectionId: col.id,
              productId: productIds[i],
              sortOrder: i,
            },
          });
        }
      }

      return col;
    });
  }

  static async updateCollection(id: string, input: any) {
    const col = await prisma.collection.findUnique({
      where: { id },
    });
    if (!col) throw new AppError('Collection not found', 404);

    const { name, slug, description, isAutomatic, rules, isActive, productIds } = input;

    // Check slug uniqueness
    if (slug && slug !== col.slug) {
      const existing = await prisma.collection.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new AppError('Collection with this URL slug already exists', 400);
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.collection.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          isAutomatic: isAutomatic !== undefined ? isAutomatic : false,
          rules: rules ? JSON.stringify(rules) : null,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      // Update manual assignments
      if (productIds !== undefined && !isAutomatic) {
        await tx.collectionProduct.deleteMany({
          where: { collectionId: id },
        });

        for (let i = 0; i < productIds.length; i++) {
          await tx.collectionProduct.create({
            data: {
              collectionId: id,
              productId: productIds[i],
              sortOrder: i,
            },
          });
        }
      }
    });
  }

  static async deleteCollection(id: string) {
    await this.getCollection(id);
    return collectionRepository.delete(id);
  }

  static async bulkAssignProducts(colId: string, productIds: string[], operation: 'REPLACE' | 'APPEND' | 'REMOVE') {
    return prisma.$transaction(async (tx) => {
      if (operation === 'REPLACE') {
        await tx.collectionProduct.deleteMany({ where: { collectionId: colId } });
        for (let i = 0; i < productIds.length; i++) {
          await tx.collectionProduct.create({
            data: { collectionId: colId, productId: productIds[i], sortOrder: i },
          });
        }
      } else if (operation === 'APPEND') {
        for (let i = 0; i < productIds.length; i++) {
          const exists = await tx.collectionProduct.findUnique({
            where: { collectionId_productId: { collectionId: colId, productId: productIds[i] } },
          });
          if (!exists) {
            await tx.collectionProduct.create({
              data: { collectionId: colId, productId: productIds[i], sortOrder: i },
            });
          }
        }
      } else if (operation === 'REMOVE') {
        await tx.collectionProduct.deleteMany({
          where: {
            collectionId: colId,
            productId: { in: productIds },
          },
        });
      }
    });
  }

  static async bulkAssignCategories(catId: string, productIds: string[], operation: 'REPLACE' | 'APPEND' | 'REMOVE') {
    // If REPLACE, set categoryId of all products to catId.
    // If APPEND, set categoryId of all selected products to catId.
    // If REMOVE, set categoryId of selected products to null or default category if categoryId matches catId.
    return prisma.$transaction(async (tx) => {
      if (operation === 'REPLACE' || operation === 'APPEND') {
        await tx.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: catId },
        });
      } else if (operation === 'REMOVE') {
        // Find a default fallback category (not equal to catId)
        const fallback = await tx.category.findFirst({
          where: { id: { not: catId }, deletedAt: null },
        });
        if (fallback) {
          await tx.product.updateMany({
            where: { id: { in: productIds }, categoryId: catId },
            data: { categoryId: fallback.id },
          });
        }
      }
    });
  }
}
