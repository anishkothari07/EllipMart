import { NextRequest } from 'next/server';
import { inventoryService } from '../../../../../lib/modules/catalog/inventory.service';
import { updateInventorySchema } from '../../../../../lib/modules/catalog/inventory.dto';
import { successResponse } from '../../../../../lib/utils/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const inventory = await inventoryService.getInventoryById(params.id);
  return successResponse(inventory, 'Inventory retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateInventorySchema.parse(body);
  
  const inventory = await inventoryService.updateInventory(params.id, parsed);
  return successResponse(inventory, 'Inventory updated successfully');
}
