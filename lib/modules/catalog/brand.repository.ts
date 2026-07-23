import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';

export class BrandRepository {
  async create(data: Prisma.BrandCreateInput) {
    return prisma.brand.create({
      data,
      include: {
        seo: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.brand.findUnique({
      where: { id },
      include: {
        seo: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.brand.findUnique({
      where: { slug },
      include: {
        seo: true,
      },
    });
  }

  async update(id: string, data: Prisma.BrandUpdateInput) {
    return prisma.brand.update({
      where: { id },
      data,
      include: {
        seo: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BrandWhereInput;
    orderBy?: Prisma.BrandOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.$transaction([
      prisma.brand.count({ where }),
      prisma.brand.findMany({
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

export const brandRepository = new BrandRepository();
