import { Category } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { prisma } from '@corecart/database';

export class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({
      data,
      include: {
        seo: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        seo: true,
        parent: true,
        children: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        seo: true,
        parent: true,
        children: true,
      },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        seo: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.$transaction([
      prisma.category.count({ where }),
      prisma.category.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          seo: true,
          parent: true,
          _count: {
            select: { children: true }
          }
        },
      }),
    ]);
  }
}

export const categoryRepository = new CategoryRepository();
