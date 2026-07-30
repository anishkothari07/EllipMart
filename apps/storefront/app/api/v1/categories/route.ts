import { NextRequest } from 'next/server';
import { categoryService } from '@corecart/commerce';
import { createCategorySchema, categorySearchSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

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
