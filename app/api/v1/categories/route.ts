import { NextRequest } from 'next/server';
import { categoryService } from '../../../../lib/modules/catalog/category.service';
import { createCategorySchema, categorySearchSchema } from '../../../../lib/modules/catalog/category.dto';
import { successResponse } from '../../../../lib/utils/response';
import { AppError } from '../../../../lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  // TODO: Add admin role check via middleware/auth
  const body = await req.json();
  const parsed = createCategorySchema.parse(body);
  
  const category = await categoryService.createCategory(parsed);
  return successResponse(category, 'Category created successfully', 201);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const query = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    search: searchParams.get('search') || undefined,
    parentId: searchParams.get('parentId') || undefined,
    isActive: searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined,
  };

  const parsed = categorySearchSchema.parse(query);
  const result = await categoryService.listCategories(parsed);
  
  return successResponse(result, 'Categories retrieved successfully');
}
