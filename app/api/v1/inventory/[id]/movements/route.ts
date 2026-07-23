import { NextRequest } from 'next/server';
import { inventoryService } from '../../../../../../lib/modules/catalog/inventory.service';
import { createInventoryMovementSchema } from '../../../../../../lib/modules/catalog/inventory.dto';
import { successResponse } from '../../../../../../lib/utils/response';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = createInventoryMovementSchema.parse(body);
  
  const result = await inventoryService.addMovement(params.id, parsed);
  return successResponse(result, 'Inventory movement recorded successfully', 201);
}
