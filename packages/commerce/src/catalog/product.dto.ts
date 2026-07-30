import { z } from 'zod';

export const productPriceSchema = z.object({
  mrp: z.number().positive(),
  sellingPrice: z.number().positive(),
  costPrice: z.number().positive().optional().nullable(),
  currency: z.string().default('USD'),
  tax: z.number().min(0).optional().nullable(),
});

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  mediaIds: z.array(z.string().uuid()).optional(),
  price: productPriceSchema.optional(),
  attributes: z.array(z.object({
    attributeId: z.string().uuid(),
    attributeValueId: z.string().uuid(),
  })).optional(),
});

export const productSpecificationSchema = z.object({
  specId: z.string().uuid(),
  value: z.string().min(1),
});

export const createProductSchema = z.object({
  brandId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1).max(200),
  shortDescription: z.string().max(500).optional().nullable(),
  longDescription: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'HIDDEN', 'SCHEDULED']).default('PUBLIC'),
  tagIds: z.array(z.string().uuid()).optional(),
  variants: z.array(productVariantSchema).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
  seo: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    canonical: z.string().url().optional().nullable(),
    ogImageId: z.string().uuid().optional().nullable(),
  }).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  visibility: z.enum(['PUBLIC', 'HIDDEN', 'SCHEDULED']).optional(),
  tags: z.string().optional(), // comma separated ids
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
