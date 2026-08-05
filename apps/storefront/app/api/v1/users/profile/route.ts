export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { userService } from '@corecart/commerce';
import { updateProfileSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  const profile = await userService.getProfile(userId);
  return successResponse(profile);
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const parsed = updateProfileSchema.parse(body);

  const updated = await userService.updateProfile(userId, parsed);
  return successResponse(updated, 'Profile updated successfully');
}

