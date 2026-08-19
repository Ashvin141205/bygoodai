/**
 * ByGoodAI Server - CSRF Protection Middleware
 * Protects cookie-authenticated state-changing requests (POST, PUT, PATCH, DELETE)
 * against Cross-Site Request Forgery (CSRF).
 *
 * Security Rules:
 * 1. Safe HTTP methods (GET, HEAD, OPTIONS) pass through.
 * 2. ONLY the exact Razorpay webhook route (/api/billing/razorpay/webhook) is exempt
 *    (as it performs independent HMAC SHA-256 signature verification on the raw request body).
 * 3. Bearer-token authenticated requests (Authorization: Bearer ... or x-api-key) are exempt
 *    as they do not rely on browser ambient cookie credentials.
 * 4. For cookie-authenticated mutations, if BOTH Origin and Referer are missing,
 *    the request is strictly rejected with HTTP 403 (code: CSRF_BLOCKED).
 * 5. If Origin or Referer is present, it MUST match the trusted host or configured allowed origins.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { SESSION_COOKIE_NAME } from '../lib/auth';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXACT_RAZORPAY_WEBHOOK_ROUTE = '/api/billing/razorpay/webhook';

/**
 * Validates request origin against allowed hostnames for cookie-authenticated state mutations
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  // 1. Safe HTTP methods do not alter server state
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // 2. Exclude ONLY the exact Razorpay webhook route (which independently verifies raw HMAC SHA-256 signature)
  const normalizedPath = (req.originalUrl || req.url || '').split('?')[0];
  if (normalizedPath === EXACT_RAZORPAY_WEBHOOK_ROUTE) {
    return next();
  }

  // 3. Exclude bearer-authenticated API requests (not vulnerable to browser cookie CSRF)
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];
  if ((authHeader && authHeader.startsWith('Bearer ')) || apiKeyHeader) {
    return next();
  }

  // 4. If request does NOT contain a session cookie, it's not a cookie-authenticated mutation
  const hasSessionCookie = Boolean(req.cookies && req.cookies[SESSION_COOKIE_NAME]);
  if (!hasSessionCookie) {
    return next();
  }

  // 5. For cookie-authenticated mutations, verify Origin or Referer
  const origin = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;

  let requestSourceOrigin: string | undefined;

  if (origin && origin.trim()) {
    try {
      requestSourceOrigin = new URL(origin).origin;
    } catch {
      requestSourceOrigin = origin.trim();
    }
  } else if (referer && referer.trim()) {
    try {
      requestSourceOrigin = new URL(referer).origin;
    } catch {
      requestSourceOrigin = referer.trim();
    }
  }

  // If BOTH Origin AND Referer are missing on a cookie-authenticated state-changing request:
  // Strictly reject with HTTP 403 CSRF_BLOCKED. (Never bypass based on Content-Type).
  if (!requestSourceOrigin) {
    return next(
      new AppError(
        'CSRF verification failed: Missing required Origin or Referer header on authenticated mutation.',
        403,
        'CSRF_BLOCKED'
      )
    );
  }

  // 6. Validate Origin/Referer against matching host
  const host = req.headers.host;
  const isProduction = process.env.NODE_ENV === 'production';

  if (host) {
    try {
      const sourceUrl = new URL(requestSourceOrigin);
      if (sourceUrl.host === host) {
        return next();
      }
    } catch {
      // Fall through to environment origins check
    }
  }

  // 7. Validate against configured environment origins
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    process.env.CLIENT_ORIGIN,
    process.env.APP_URL,
  ]
    .filter(Boolean)
    .flatMap((s) => (s as string).split(',').map((p) => p.trim()))
    .filter((s) => s && s !== '*');

  for (const allowed of allowedOrigins) {
    try {
      if (new URL(allowed).origin === requestSourceOrigin) {
        return next();
      }
    } catch {
      if (allowed === requestSourceOrigin) {
        return next();
      }
    }
  }

  // 8. In development/preview sandbox, allow local loopback origins
  if (!isProduction) {
    if (
      requestSourceOrigin.includes('localhost') ||
      requestSourceOrigin.includes('127.0.0.1') ||
      requestSourceOrigin.includes('.run.app')
    ) {
      return next();
    }
  }

  return next(
    new AppError(
      `Cross-site request blocked: origin "${requestSourceOrigin}" is not authorized for cookie-authenticated operations.`,
      403,
      'CSRF_BLOCKED'
    )
  );
}
