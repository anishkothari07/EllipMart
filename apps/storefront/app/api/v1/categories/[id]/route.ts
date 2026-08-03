import { NextRequest } from 'next/server';
import { categoryService } from '@corecart/commerce';
import { updateCategorySchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await categoryService.getCategoryById(id);
  return successResponse(category, 'Category retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateCategorySchema.parse(body);
  
  const { id } = await params;
  const category = await categoryService.updateCategory(id, parsed);
  return successResponse(category, 'Category updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: Add admin role check via middleware/auth
  const { id } = await params;
  await categoryService.deleteCategory(id);
  return successResponse(null, 'Category deleted successfully');
}
