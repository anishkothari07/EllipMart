export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { prisma } from '@corecart/database';
import { updateInventorySchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inventory = await prisma.inventory.findUnique({ where: { id } });
  if (!inventory) {
    return successResponse(null, 'Inventory not found', 404);
  }
  return successResponse(inventory, 'Inventory retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateInventorySchema.parse(body);
  
  const { id } = await params;
  const inventory = await prisma.inventory.update({
    where: { id },
    data: parsed,
  });
  return successResponse(inventory, 'Inventory updated successfully');
}
