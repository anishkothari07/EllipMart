import { z } from 'zod';

export const createInventoryMovementSchema = z.object({
  quantity: z.number().int(),
  type: z.enum(['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'RESERVATION']),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateInventorySchema = z.object({
  lowStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER', 'DISCONTINUED']).optional(),
});

export const inventorySearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER', 'DISCONTINUED']).optional(),
  lowStockOnly: z.coerce.boolean().optional(),
});

export type CreateInventoryMovementInput = z.infer<typeof createInventoryMovementSchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type InventorySearchInput = z.infer<typeof inventorySearchSchema>;
