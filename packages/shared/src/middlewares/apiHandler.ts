import { NextRequest } from 'next/server';
import { AppError } from '../utils/errorHandler';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<Response>;

export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      logger.info({ method: req.method, url: req.url }, 'Incoming request');
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
