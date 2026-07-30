import { productRepository } from './product.repository';
import { CreateProductInput, UpdateProductInput, ProductSearchInput } from './product.dto';
import { AppError } from '@corecart/shared';
import { Prisma } from '@prisma/client';

export class ProductService {
  async createProduct(input: CreateProductInput) {
    const existing = await productRepository.findBySlug(input.slug);
    if (existing) {
      throw new AppError('Product with this slug already exists', 400);
    }

    const { seo, variants, tagIds, specifications, ...data } = input;

    const createData: Prisma.ProductCreateInput = {
      ...data,
      seo: seo ? { create: seo } : undefined,
      tags: tagIds ? {
        create: tagIds.map(tagId => ({
          tag: { connect: { id: tagId } }
        }))
      } : undefined,
      specifications: specifications ? {
        create: specifications.map(spec => ({
          value: spec.value,
          spec: { connect: { id: spec.specId } }
        }))
      } : undefined,
      variants: variants ? {
        create: variants.map(v => {
          const { price, attributes, mediaIds, ...variantData } = v;
          return {
            ...variantData,
            price: price ? { create: price } : undefined,
            attributes: attributes ? {
              create: attributes.map(attr => ({
                attribute: { connect: { id: attr.attributeId } },
                attributeValue: { connect: { id: attr.attributeValueId } }
              }))
            } : undefined,
            media: mediaIds ? {
              create: mediaIds.map((mediaId, idx) => ({
                media: { connect: { id: mediaId } },
                sortOrder: idx
              }))
            } : undefined
          };
        })
      } : undefined,
    };

    return productRepository.create(createData);
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await this.getProductById(id);

    if (input.slug && input.slug !== product.slug) {
      const existing = await productRepository.findBySlug(input.slug);
      if (existing) {
        throw new AppError('Product with this slug already exists', 400);
      }
    }

    const { seo, variants, tagIds, specifications, ...data } = input;

    const updateData: Prisma.ProductUpdateInput = {
      ...data,
      seo: seo ? {
        upsert: {
          create: seo,
          update: seo,
        }
      } : undefined,
    };

    // For updates on relations, it's easier to recreate the connections or manage individually
    if (tagIds !== undefined) {
      updateData.tags = {
        deleteMany: {}, // remove old
        create: tagIds.map(tagId => ({
          tag: { connect: { id: tagId } }
        }))
      };
    }

    if (specifications !== undefined) {
      updateData.specifications = {
        deleteMany: {},
        create: specifications.map(spec => ({
          value: spec.value,
          spec: { connect: { id: spec.specId } }
        }))
      };
    }

    // Advanced Variant updates would ideally map via IDs, handling creates, updates, and deletes
    // We simplify here:
    if (variants) {
      // NOTE: This will only handle updates to provided variant objects.
      updateData.variants = {
        update: variants.filter(v => v.id).map(v => {
          const { price, attributes, mediaIds, ...vData } = v;
          return {
            where: { id: v.id },
            data: {
              ...vData,
              price: price ? {
                upsert: { create: price, update: price }
              } : undefined,
              // further nested updates like attributes/media omitted for brevity in partial update
            }
          };
        }),
        create: variants.filter(v => !v.id).map(v => {
          const { price, attributes, mediaIds, ...vData } = v;
          return {
            ...vData,
            price: price ? { create: price } : undefined,
            attributes: attributes ? {
              create: attributes.map(attr => ({
                attribute: { connect: { id: attr.attributeId } },
                attributeValue: { connect: { id: attr.attributeValueId } }
              }))
            } : undefined,
          };
        })
      };
    }

    return productRepository.update(id, updateData);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    return productRepository.delete(id);
  }

  async listProducts(params: ProductSearchInput) {
    const { page, limit, search, categoryId, brandId, status, visibility, tags, minPrice, maxPrice } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { variants: { some: { sku: { contains: search } } } }
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;

    if (tags) {
      const tagIdsList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagIdsList.length > 0) {
        where.tags = {
          some: { tagId: { in: tagIdsList } }
        };
      }
    }

    // Price filtering across variants
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.variants = {
        ...where.variants,
        some: {
          ...where.variants?.some,
          price: {
            sellingPrice: {
              gte: minPrice,
              lte: maxPrice,
            }
          }
        }
      };
    }

    const [total, items] = await productRepository.findAll({
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

export const productService = new ProductService();
