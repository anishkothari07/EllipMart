import { attributeRepository } from './attribute.repository';
import { CreateAttributeInput, UpdateAttributeInput, AttributeSearchInput } from './attribute.dto';
import { AppError } from '@corecart/shared';
import { Prisma } from '@prisma/client';

export class AttributeService {
  async createAttribute(input: CreateAttributeInput) {
    const existing = await attributeRepository.findByName(input.name);
    if (existing) {
      throw new AppError('Attribute with this name already exists', 400);
    }

    const { values, slug, isRequired, ...data } = input as any;

    const createData: Prisma.AttributeCreateInput = {
      ...data,
      values: values && values.length > 0 ? {
        create: values.map((v: any) => ({
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

  async getAttributeByName(name: string) {
    const attribute = await attributeRepository.findByName(name);
    if (!attribute) {
      throw new AppError('Attribute not found', 404);
    }
    return attribute;
  }

  async updateAttribute(id: string, input: UpdateAttributeInput) {
    const attribute = await this.getAttributeById(id);

    if (input.name && input.name !== attribute.name) {
      const existing = await attributeRepository.findByName(input.name);
      if (existing) {
        throw new AppError('Attribute with this name already exists', 400);
      }
    }

    const { values, slug, isRequired, ...data } = input as any;

    const updateData: Prisma.AttributeUpdateInput = {
      ...data,
    };

    if (values) {
      updateData.values = {
        // delete missing
        deleteMany: {
          id: {
            notIn: values.filter((v: any) => v.id).map((v: any) => v.id as string)
          }
        },
        // update existing
        update: values.filter((v: any) => v.id).map((v: any) => ({
          where: { id: v.id },
          data: {
            value: v.value,
            label: v.label,
            color: v.color,
            sortOrder: v.sortOrder,
          }
        })),
        // create new
        create: values.filter((v: any) => !v.id).map((v: any) => ({
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
