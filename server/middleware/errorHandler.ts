/**
 * ByGoodAI Server - Central Error Handling Middleware
 * Provides safe, structured JSON error responses without leaking internal stack traces or secrets.
 * Implements sanitized structured server-side logging.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: any;
  requestId?: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Sanitizes and logs structured error telemetry without exposing secrets or credentials
 */
function logSanitizedError(req: Request, statusCode: number, errorCode: string, message: string, _err: any) {
  const requestId = (req as any).id || (req.headers['x-request-id'] as string) || 'none';
  const safeRoute = (req.originalUrl || req.url || '').split('?')[0];
  const method = req.method;

  // Structured sanitized log line
  const logData = {
    timestamp: new Date().toISOString(),
    requestId,
    method,
    route: safeRoute,
    statusCode,
    errorCode,
    message: message.slice(0, 300),
  };

  if (statusCode >= 500) {
    console.error(`[API Server Error] ${JSON.stringify(logData)}`);
  } else if (statusCode >= 400) {
    console.warn(`[API Client Warning] ${JSON.stringify(logData)}`);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  const requestId = (req as any).id || (req.headers['x-request-id'] as string) || undefined;

  // 1. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const statusCode = 400;
    const errorCode = 'VALIDATION_ERROR';
    const message = 'Invalid request payload or query parameters';
    logSanitizedError(req, statusCode, errorCode, message, err);

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        requestId,
        details: err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  }

  // 2. Handle Custom AppError
  if (err instanceof AppError) {
    logSanitizedError(req, err.statusCode, err.code, err.message, err);

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    });
  }

  // 3. Handle SyntaxError (e.g. malformed JSON body)
  if (err instanceof SyntaxError && 'body' in err) {
    const statusCode = 400;
    const errorCode = 'BAD_REQUEST';
    const message = 'Malformed JSON payload in request body';
    logSanitizedError(req, statusCode, errorCode, message, err);

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        requestId,
      },
    });
  }

  // 4. Handle Prisma database errors safely without leaking DB credentials or queries
  if (err?.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const statusCode = 409;
      const errorCode = 'CONFLICT';
      const message = 'A resource with this identifier already exists';
      logSanitizedError(req, statusCode, errorCode, message, err);

      return res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message,
          requestId,
        },
      });
    }
    if (err.code === 'P2025') {
      const statusCode = 404;
      const errorCode = 'NOT_FOUND';
      const message = 'Requested record was not found in the database';
      logSanitizedError(req, statusCode, errorCode, message, err);

      return res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message,
          requestId,
        },
      });
    }

    const statusCode = 503;
    const errorCode = 'DATABASE_ERROR';
    const message = 'Database query could not be completed. The operation may be degraded.';
    logSanitizedError(req, statusCode, errorCode, message, err);

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        requestId,
      },
    });
  }

  // 5. Default 500 Internal Server Error
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = 'INTERNAL_SERVER_ERROR';
  const rawMessage = err?.message || 'Internal Server Error';
  const safeMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred'
    : rawMessage;

  logSanitizedError(req, statusCode, errorCode, rawMessage, err);

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: safeMessage,
      requestId,
    },
  });
}
