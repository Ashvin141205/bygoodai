/**
 * ByGoodAI Server - Request ID Middleware
 * Generates and attaches a cryptographically secure unique Request ID (UUID v4)
 * to every incoming HTTP request for end-to-end tracing, structured logging, and error correlation.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Attaches unique request ID to req.id and sets X-Request-Id response header
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(incomingId.trim())
      ? incomingId.trim()
      : crypto.randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
