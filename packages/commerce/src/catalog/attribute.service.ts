import { attributeRepository } from './attribute.repository';
import { CreateAttributeInput, UpdateAttributeInput, AttributeSearchInput } from './attribute.dto';
import { AppError } from '@corecart/shared';
import { Prisma } from '@prisma/client';

export class AttributeService {
  async createAttribute(input: CreateAttributeInput) {
    const existing = await attributeRepository.findBySlug(input.slug);
    if (existing) {
      throw new AppError('Attribute with this slug already exists', 400);
    }

    const { values, ...data } = input;

    const createData: Prisma.AttributeCreateInput = {
      ...data,
      values: values && values.length > 0 ? {
        create: values.map(v => ({
          value: v.value,
          label: v.label,
          color: v.color,
          sortOrder: v.sortOrder,
        }))
      } : undefined
    };

    return attributeRepository.create(createData);
  }

  async getAttributeById(id: string) {
    const attribute = await attributeRepository.findById(id);
    if (!attribute) {
      throw new AppError('Attribute not found', 404);
    }
    return attribute;
  }

  async getAttributeBySlug(slug: string) {
    const attribute = await attributeRepository.findBySlug(slug);
    if (!attribute) {
      throw new AppError('Attribute not found', 404);
    }
    return attribute;
  }

  async updateAttribute(id: string, input: UpdateAttributeInput) {
    const attribute = await this.getAttributeById(id);

    if (input.slug && input.slug !== attribute.slug) {
      const existing = await attributeRepository.findBySlug(input.slug);
      if (existing) {
        throw new AppError('Attribute with this slug already exists', 400);
      }
    }

    const { values, ...data } = input;

    const updateData: Prisma.AttributeUpdateInput = {
      ...data,
    };

    if (values) {
      updateData.values = {
        // delete missing
        deleteMany: {
          id: {
            notIn: values.filter(v => v.id).map(v => v.id as string)
          }
        },
        // update existing
        update: values.filter(v => v.id).map(v => ({
          where: { id: v.id },
          data: {
            value: v.value,
            label: v.label,
            color: v.color,
            sortOrder: v.sortOrder,
          }
        })),
        // create new
        create: values.filter(v => !v.id).map(v => ({
          value: v.value!,
          label: v.label!,
          color: v.color,
          sortOrder: v.sortOrder,
        }))
      };
    }

    return attributeRepository.update(id, updateData);
  }

  async deleteAttribute(id: string) {
    await this.getAttributeById(id);
    // Hard delete for attributes typically unless used by products,
    // Prisma will restrict delete if relation exists without Cascade
    try {
      return await attributeRepository.delete(id);
    } catch (error) {
      throw new AppError('Cannot delete attribute, it might be in use', 400);
    }
  }

  async listAttributes(params: AttributeSearchInput) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AttributeWhereInput = {};

    if (search) {
      where.name = { contains: search };
    }

    const [total, items] = await attributeRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { name: 'asc' }
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}

export const attributeService = new AttributeService();
