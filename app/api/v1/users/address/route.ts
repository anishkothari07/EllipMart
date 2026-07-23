import { NextRequest } from 'next/server';
import { userService } from '../../../../../lib/modules/user/user.service';
import { createAddressSchema } from '../../../../../lib/modules/user/user.dto';
import { successResponse } from '../../../../../lib/utils/response';
import { AppError } from '../../../../../lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const parsed = createAddressSchema.parse(body);

  const address = await userService.addAddress(userId, parsed);
  return successResponse(address, 'Address added successfully', 201);
}
