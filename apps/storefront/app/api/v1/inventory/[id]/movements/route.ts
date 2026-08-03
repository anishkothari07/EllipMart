import { NextRequest } from 'next/server';
import { MerchantInventoryService } from '@corecart/commerce';
import { createInventoryMovementSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = createInventoryMovementSchema.parse(body);
  
  const { id } = await params;
  const adjustType = parsed.quantity < 0 || parsed.type === 'SALE' || parsed.type === 'DAMAGE' ? 'DECREASE' : 'INCREASE';
  const reason = ['PURCHASE', 'ADJUSTMENT', 'RETURN'].includes(parsed.type) ? parsed.type as any : 'OTHER';
  const result = await MerchantInventoryService.adjustVariantInventory(id, {
    adjustType,
    quantity: Math.abs(parsed.quantity),
    reason,
    notes: parsed.notes || undefined
  });
  return successResponse(result, 'Inventory movement recorded successfully', 201);
}
