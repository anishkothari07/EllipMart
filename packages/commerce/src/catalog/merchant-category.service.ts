import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';
import type { Prisma } from '@corecart/database';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

export class MerchantCategoryService {
  static async listCategoriesTree(): Promise<CategoryNode[]> {
    const list = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });

    // Compile into hierarchical tree
    const map = new Map<string, CategoryNode>();
    list.forEach((item) => {
      map.set(item.id, {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        isActive: item.isActive,
        parentId: item.parentId,
        sortOrder: item.sortOrder,
        children: [],
      });
    });

    const roots: CategoryNode[] = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  static async getCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        seo: true,
        parent: true,
      },
    });

    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  static async createCategory(input: any) {
    const { name, slug, description, parentId, isActive, sortOrder, seo } = input;

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError('Category with this URL slug already exists', 400);
    }

    return prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
        seo: seo ? { create: seo } : undefined,
      },
    });
  }

  static async updateCategory(id: string, input: any) {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new AppError('Category not found', 404);

    const { name, slug, description, parentId, isActive, sortOrder, seo } = input;

    // Check slug uniqueness
    if (slug && slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new AppError('Category with this URL slug already exists', 400);
      }
    }

    // Check for circular reference: parentId cannot be equal to id
    if (parentId && parentId === id) {
      throw new AppError('A category cannot be its own parent', 400);
    }

    return prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        seo: seo ? {
          upsert: {
            create: seo,
            update: seo,
          },
        } : undefined,
      },
    });
  }

  static async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category) throw new AppError('Category not found', 404);

    return prisma.$transaction(async (tx) => {
      // Re-parent children categories to parentId of the deleted category
      if (category.children.length > 0) {
        await tx.category.updateMany({
          where: { parentId: id },
          data: { parentId: category.parentId },
        });
      }

      // Soft delete category
      return tx.category.update({
        where: { id },
        data: { deletedAt: new Date(), parentId: null },
      });
    });
  }

  static async moveCategory(id: string, parentId: string | null, sortOrder: number) {
    // Check circular references
    if (parentId === id) {
      throw new AppError('A category cannot be its own parent', 400);
    }

    return prisma.category.update({
      where: { id },
      data: {
        parentId: parentId || null,
        sortOrder,
      },
    });
  }
}
