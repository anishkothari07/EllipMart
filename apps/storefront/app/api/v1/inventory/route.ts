import { NextRequest } from 'next/server';
import { MerchantInventoryService } from '@corecart/commerce';
import { inventorySearchSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const query = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    status: searchParams.get('status') || undefined,
    lowStockOnly: searchParams.has('lowStockOnly') ? searchParams.get('lowStockOnly') === 'true' : undefined,
  };

  const parsed = inventorySearchSchema.parse(query);
  const result = await MerchantInventoryService.listMerchantInventory(parsed);
  
  return successResponse(result, 'Inventory retrieved successfully');
}
