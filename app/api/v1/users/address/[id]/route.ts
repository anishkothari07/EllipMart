import { NextRequest } from 'next/server';
import { userService } from '../../../../../../lib/modules/user/user.service';
import { updateAddressSchema } from '../../../../../../lib/modules/user/user.dto';
import { successResponse } from '../../../../../../lib/utils/response';
import { AppError } from '../../../../../../lib/utils/errorHandler';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const parsed = updateAddressSchema.parse(body);

  const address = await userService.updateAddress(userId, params.id, parsed);
  return successResponse(address, 'Address updated successfully');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  await userService.deleteAddress(userId, params.id);
  return successResponse(null, 'Address deleted successfully');
}
