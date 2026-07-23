import { NextRequest } from 'next/server';
import { categoryService } from '../../../../../lib/modules/catalog/category.service';
import { updateCategorySchema } from '../../../../../lib/modules/catalog/category.dto';
import { successResponse } from '../../../../../lib/utils/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const category = await categoryService.getCategoryById(params.id);
  return successResponse(category, 'Category retrieved successfully');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = updateCategorySchema.parse(body);
  
  const category = await categoryService.updateCategory(params.id, parsed);
  return successResponse(category, 'Category updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role check via middleware/auth
  await categoryService.deleteCategory(params.id);
  return successResponse(null, 'Category deleted successfully');
}
