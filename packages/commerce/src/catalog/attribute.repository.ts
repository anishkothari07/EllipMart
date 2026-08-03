import { Prisma } from '@prisma/client';
import { prisma } from '@corecart/database';

export class AttributeRepository {
  async create(data: Prisma.AttributeCreateInput) {
    return prisma.attribute.create({
      data,
      include: {
        values: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.attribute.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' }
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.attribute.findUnique({
      where: { name },
      include: {
        values: true,
      },
    });
  }

  async update(id: string, data: Prisma.AttributeUpdateInput) {
    return prisma.attribute.update({
      where: { id },
      data,
      include: {
        values: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.attribute.delete({
      where: { id },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AttributeWhereInput;
    orderBy?: Prisma.AttributeOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.$transaction([
      prisma.attribute.count({ where }),
      prisma.attribute.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          values: {
            orderBy: { sortOrder: 'asc' }
          },
        },
      }),
    ]);
  }
}

export const attributeRepository = new AttributeRepository();
