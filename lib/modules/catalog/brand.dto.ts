import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  logoMediaId: z.string().uuid().optional().nullable(),
  website: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  seo: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    canonical: z.string().url().optional().nullable(),
    ogImageId: z.string().uuid().optional().nullable(),
  }).optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export const brandSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type BrandSearchInput = z.infer<typeof brandSearchSchema>;
