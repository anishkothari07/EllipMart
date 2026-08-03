import { brandRepository } from './brand.repository';
import { CreateBrandInput, UpdateBrandInput, BrandSearchInput } from './brand.dto';
import { AppError } from '@corecart/shared';
import { Prisma } from '@prisma/client';

export class BrandService {
  async createBrand(input: CreateBrandInput) {
    const existing = await brandRepository.findBySlug(input.slug);
    if (existing) {
      throw new AppError('Brand with this slug already exists', 400);
    }

    const { seo, ...data } = input;

    const createData: Prisma.BrandCreateInput = {
      ...data,
      seo: seo ? {
        create: seo
      } : undefined
    };

    return brandRepository.create(createData);
  }

  async getBrandById(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new AppError('Brand not found', 404);
    }
    return brand;
  }

  async getBrandBySlug(slug: string) {
    const brand = await brandRepository.findBySlug(slug);
    if (!brand) {
      throw new AppError('Brand not found', 404);
    }
    return brand;
  }

  async updateBrand(id: string, input: UpdateBrandInput) {
    const brand = await this.getBrandById(id);

    if (input.slug && input.slug !== brand.slug) {
      const existing = await brandRepository.findBySlug(input.slug);
      if (existing) {
        throw new AppError('Brand with this slug already exists', 400);
      }
    }

    const { seo, ...data } = input;

    const updateData: Prisma.BrandUpdateInput = {
      ...data,
      seo: seo ? {
        upsert: {
          create: seo,
          update: seo,
        }
      } : undefined
    };

    return brandRepository.update(id, updateData);
  }

  async deleteBrand(id: string) {
    await this.getBrandById(id);
    return brandRepository.delete(id);
  }

  async listBrands(params: BrandSearchInput) {
    const { page, limit, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [total, items] = await brandRepository.findAll({
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

export const brandService = new BrandService();
