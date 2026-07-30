import { NextRequest } from 'next/server';
import { userService } from '@corecart/commerce';
import { updateAddressSchema } from '@corecart/commerce';
import { successResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  const { id: addressId } = await params;
  const body = await req.json();
  const parsed = updateAddressSchema.parse(body);

  const address = await userService.updateAddress(userId, addressId, parsed);
  return successResponse(address, 'Address updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  const { id: addressId } = await params;
  await userService.deleteAddress(userId, addressId);
  return successResponse(null, 'Address deleted successfully');
}
