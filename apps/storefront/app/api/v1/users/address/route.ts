export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { userService } from '@corecart/commerce';
import { createAddressSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const parsed = createAddressSchema.parse(body);

  const address = await userService.addAddress(userId, parsed);
  return successResponse(address, 'Address added successfully', 201);
}

