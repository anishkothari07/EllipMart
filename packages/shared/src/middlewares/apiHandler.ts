import { NextRequest } from 'next/server';
import { AppError } from '../utils/errorHandler';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<Response>;

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function apiHandler(handler: RouteHandler, options: ApiHandlerOptions = {}): RouteHandler {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      logger.info({ method: req.method, url: req.url }, 'Incoming request');

      if (options.requireAuth || (options.allowedRoles && options.allowedRoles.length > 0)) {
        const userId = req.headers.get('x-user-id');
        const role = req.headers.get('x-user-role');
        
        if (!userId) {
          throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        if (options.allowedRoles && options.allowedRoles.length > 0) {
          if (!role || !options.allowedRoles.includes(role)) {
            throw new AppError('Forbidden: Insufficient role', 403, 'FORBIDDEN');
          }
        }
      }

      const response = await handler(req, ...args);
      return response;
    } catch (error: any) {
      logger.error(error, 'Unhandled API Error');

      if (error instanceof AppError) {
        return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
      }

      if (error instanceof ZodError) {
        return errorResponse('Validation Error', 'VALIDATION_ERROR', error.issues, 400);
      }

      return errorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
    }
  };
}
