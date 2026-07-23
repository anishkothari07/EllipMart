import { z } from 'zod';

export const createAttributeValueSchema = z.object({
  value: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  color: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const updateAttributeValueSchema = createAttributeValueSchema.partial().extend({
  id: z.string().uuid().optional(),
});

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required').max(100),
  slug: z.string().min(1).max(100),
  type: z.enum(['TEXT', 'COLOR', 'IMAGE', 'BUTTON']),
  isFilterable: z.boolean().default(true),
  isRequired: z.boolean().default(false),
  values: z.array(createAttributeValueSchema).optional(),
});

export const updateAttributeSchema = createAttributeSchema.partial().extend({
  values: z.array(updateAttributeValueSchema).optional(),
});

export const attributeSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type AttributeSearchInput = z.infer<typeof attributeSearchSchema>;
