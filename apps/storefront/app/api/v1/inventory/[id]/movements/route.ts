import { NextRequest } from 'next/server';
import { inventoryService } from '@corecart/commerce';
import { createInventoryMovementSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = createInventoryMovementSchema.parse(body);
  
  const result = await inventoryService.addMovement(params.id, parsed);
  return successResponse(result, 'Inventory movement recorded successfully', 201);
}
