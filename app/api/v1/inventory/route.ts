import { NextRequest } from 'next/server';
import { inventoryService } from '../../../../lib/modules/catalog/inventory.service';
import { inventorySearchSchema } from '../../../../lib/modules/catalog/inventory.dto';
import { successResponse } from '../../../../lib/utils/response';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const query = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    status: searchParams.get('status') || undefined,
    lowStockOnly: searchParams.has('lowStockOnly') ? searchParams.get('lowStockOnly') === 'true' : undefined,
  };

  const parsed = inventorySearchSchema.parse(query);
  const result = await inventoryService.listInventory(parsed);
  
  return successResponse(result, 'Inventory retrieved successfully');
}
