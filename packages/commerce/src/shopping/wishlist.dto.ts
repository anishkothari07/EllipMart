import { z } from 'zod';

export const addToWishlistSchema = z.object({
  productId: z.string().uuid(),
});

export const bulkDeleteWishlistSchema = z.object({
  productIds: z.array(z.string().uuid()),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type BulkDeleteWishlistInput = z.infer<typeof bulkDeleteWishlistSchema>;
