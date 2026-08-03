import { NextRequest } from 'next/server';
import { attributeService } from '@corecart/commerce';
import { updateAttributeSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attribute = await attributeService.getAttributeById(id);
  return successResponse(attribute, 'Attribute retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateAttributeSchema.parse(body);
  
  const { id } = await params;
  const attribute = await attributeService.updateAttribute(id, parsed);
  return successResponse(attribute, 'Attribute updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const { id } = await params;
  await attributeService.deleteAttribute(id);
  return successResponse(null, 'Attribute deleted successfully');
}
