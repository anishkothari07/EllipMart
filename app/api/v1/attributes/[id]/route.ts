import { NextRequest } from 'next/server';
import { attributeService } from '../../../../../lib/modules/catalog/attribute.service';
import { updateAttributeSchema } from '../../../../../lib/modules/catalog/attribute.dto';
import { successResponse } from '../../../../../lib/utils/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const attribute = await attributeService.getAttributeById(params.id);
  return successResponse(attribute, 'Attribute retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateAttributeSchema.parse(body);
  
  const attribute = await attributeService.updateAttribute(params.id, parsed);
  return successResponse(attribute, 'Attribute updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  await attributeService.deleteAttribute(params.id);
  return successResponse(null, 'Attribute deleted successfully');
}
