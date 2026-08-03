import { collectionRepository } from './collection.repository';
import { CreateCollectionInput, UpdateCollectionInput, CollectionSearchInput } from './collection.dto';
import { AppError } from '@corecart/shared';
import { Prisma } from '@prisma/client';

export class CollectionService {
  async createCollection(input: CreateCollectionInput) {
    const existing = await collectionRepository.findBySlug(input.slug);
    if (existing) {
      throw new AppError('Collection with this slug already exists', 400);
    }

    const { seo, rules, ...data } = input as any;

    const createData: Prisma.CollectionCreateInput = {
      ...data,
      rules: typeof rules === 'string' ? rules : rules ? JSON.stringify(rules) : undefined,
    };

    return collectionRepository.create(createData);
  }

  async getCollectionById(id: string) {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw new AppError('Collection not found', 404);
    }
    return collection;
  }

  async getCollectionBySlug(slug: string) {
    const collection = await collectionRepository.findBySlug(slug);
    if (!collection) {
      throw new AppError('Collection not found', 404);
    }
    return collection;
  }

  async updateCollection(id: string, input: UpdateCollectionInput) {
    const collection = await this.getCollectionById(id);

    if (input.slug && input.slug !== collection.slug) {
      const existing = await collectionRepository.findBySlug(input.slug);
      if (existing) {
        throw new AppError('Collection with this slug already exists', 400);
      }
    }

    const { seo, rules, ...data } = input as any;

    const updateData: Prisma.CollectionUpdateInput = {
      ...data,
    };

    if (rules !== undefined) {
      updateData.rules = typeof rules === 'string' ? rules : rules ? JSON.stringify(rules) : null;
    }

    return collectionRepository.update(id, updateData);
  }

  async deleteCollection(id: string) {
    await this.getCollectionById(id);
    return collectionRepository.delete(id);
  }

  async listCollections(params: CollectionSearchInput) {
    const { page, limit, search, type, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CollectionWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }



    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [total, items] = await collectionRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' }
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

export const collectionService = new CollectionService();
