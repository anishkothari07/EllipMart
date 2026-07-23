import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';

export class ProductRepository {
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: {
        seo: true,
        variants: {
          include: {
            price: true,
            attributes: true,
          }
        },
        tags: true,
        specifications: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        seo: true,
        category: true,
        brand: true,
        variants: {
          include: {
            price: true,
            attributes: true,
          }
        },
        tags: {
          include: { tag: true }
        },
        specifications: {
          include: { spec: true }
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        seo: true,
        category: true,
        brand: true,
        variants: {
          where: { isActive: true },
          include: {
            price: true,
            attributes: true,
          }
        },
        tags: {
          include: { tag: true }
        },
        specifications: {
          include: { spec: true }
        },
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        seo: true,
        variants: {
          include: {
            price: true,
          }
        },
        tags: true,
        specifications: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          category: true,
          brand: true,
          variants: {
            take: 1, // useful for listing to get a default price/image
            include: { price: true }
          },
        },
      }),
    ]);
  }
}

export const productRepository = new ProductRepository();
