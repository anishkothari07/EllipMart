import { categoryRepository } from './category.repository';
import { CreateCategoryInput, UpdateCategoryInput, CategorySearchInput } from './category.dto';
import { AppError } from '@corecart/shared';
import type { Prisma } from '@prisma/client';

export class CategoryService {
  async createCategory(input: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(input.slug);
    if (existing) {
      throw new AppError('Category with this slug already exists', 400);
    }

    const { seo, ...data } = input;

    const createData: Prisma.CategoryCreateInput = {
      ...data,
      seo: seo ? {
        create: seo
      } : undefined
    };

    return categoryRepository.create(createData);
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await this.getCategoryById(id);

    if (input.slug && input.slug !== category.slug) {
      const existing = await categoryRepository.findBySlug(input.slug);
      if (existing) {
        throw new AppError('Category with this slug already exists', 400);
      }
    }

    const { seo, ...data } = input;

    const updateData: Prisma.CategoryUpdateInput = {
      ...data,
      seo: seo ? {
        upsert: {
          create: seo,
          update: seo,
        }
      } : undefined
    };

    return categoryRepository.update(id, updateData);
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id);
    // TODO: Optionally check if there are child categories or products and block deletion
    return categoryRepository.delete(id);
  }

  async listCategories(params: CategorySearchInput) {
    const { page, limit, search, parentId, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [total, items] = await categoryRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { sortOrder: 'asc' }
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

export const categoryService = new CategoryService();
