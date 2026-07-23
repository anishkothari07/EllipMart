import { NextRequest } from 'next/server';
import { authRepository } from '../../../../../lib/modules/auth/auth.repository';
import { successResponse, errorResponse } from '../../../../../lib/utils/response';
import { AppError } from '../../../../../lib/utils/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Omit passwordHash
    const { passwordHash, ...safeUser } = user;

    return successResponse(safeUser);
  } catch (error: any) {
    if (error.isOperational) {
      return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    }
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
