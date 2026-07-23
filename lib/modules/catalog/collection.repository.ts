import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';

export class CollectionRepository {
  async create(data: Prisma.CollectionCreateInput) {
    return prisma.collection.create({
      data,
      include: {
        seo: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        seo: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.collection.findUnique({
      where: { slug },
      include: {
        seo: true,
      },
    });
  }

  async update(id: string, data: Prisma.CollectionUpdateInput) {
    return prisma.collection.update({
      where: { id },
      data,
      include: {
        seo: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.collection.update({
      where: { id },
      data: { deletedAt: new Date() },
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
        include: {
          seo: true,
        },
      }),
    ]);
  }
}

export const collectionRepository = new CollectionRepository();
