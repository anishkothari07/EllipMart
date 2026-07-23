import { NextResponse } from 'next/server';

export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
}

export function successResponse<T>(data?: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, code = 'INTERNAL_SERVER_ERROR', details?: unknown, status = 500) {
  return NextResponse.json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  }, { status });
}
