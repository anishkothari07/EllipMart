import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  iconMediaId: z.string().uuid().optional().nullable(),
  bannerMediaId: z.string().uuid().optional().nullable(),
  thumbnailMediaId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  seo: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    canonical: z.string().url().optional().nullable(),
    ogImageId: z.string().uuid().optional().nullable(),
  }).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categorySearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategorySearchInput = z.infer<typeof categorySearchSchema>;
