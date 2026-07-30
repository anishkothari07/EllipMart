import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['MANUAL', 'AUTOMATIC']).default('MANUAL'),
  rules: z.any().optional().nullable(),
  isActive: z.boolean().default(true),
  seo: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    canonical: z.string().url().optional().nullable(),
    ogImageId: z.string().uuid().optional().nullable(),
  }).optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const collectionSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CollectionSearchInput = z.infer<typeof collectionSearchSchema>;
