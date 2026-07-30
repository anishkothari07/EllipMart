import { NextRequest } from 'next/server';
import { attributeService } from '@corecart/commerce';
import { createAttributeSchema, attributeSearchSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function POST(req: NextRequest) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = createAttributeSchema.parse(body);
  
  const attribute = await attributeService.createAttribute(parsed);
  return successResponse(attribute, 'Attribute created successfully', 201);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const query = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    search: searchParams.get('search') || undefined,
  };

  const parsed = attributeSearchSchema.parse(query);
  const result = await attributeService.listAttributes(parsed);
  
  return successResponse(result, 'Attributes retrieved successfully');
}
