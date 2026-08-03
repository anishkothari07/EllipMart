import type { Prisma } from '@prisma/client';
import { prisma } from '@corecart/database';

export class CollectionRepository {
  async create(data: Prisma.CollectionCreateInput) {
    return prisma.collection.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return prisma.collection.findUnique({
      where: { slug },
    });
  }

  async update(id: string, data: Prisma.CollectionUpdateInput) {
    return prisma.collection.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.collection.delete({
      where: { id },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.$transaction([
      prisma.collection.count({ where }),
      prisma.collection.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
    ]);
  }
}

export const collectionRepository = new CollectionRepository();
