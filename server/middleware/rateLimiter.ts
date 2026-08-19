/**
 * ByGoodAI Server - Rate Limiting Middleware
 * Protects endpoints from abuse, credential stuffing, and resource exhaustion
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Standard API rate limiter (120 requests per minute per IP)
 */
export const standardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down and try again.',
    },
  },
});

/**
 * Stricter limiter for write operations (40 writes per minute per IP)
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Write operation limit exceeded. Please wait a moment before retrying.',
    },
  },
});

/**
 * Rate limiter for sensitive authentication endpoints (20 requests per 15 minutes per IP)
 * Protects against brute-force attacks and credential stuffing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please wait a few minutes before trying again.',
    },
  },
});

/**
 * Rate limiter for expensive AI endpoints (20 requests per minute per IP)
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached. Please wait before generating additional prompts.',
    },
  },
});

/**
 * Rate limiter for Developer API (/api/v1) endpoints (keyed by User ID, API key ID, or IP)
 */
export const developerApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if ((req as any).user?.id) {
      return (req as any).user.id;
    }
    if ((req as any).apiKey?.id) {
      return (req as any).apiKey.id;
    }
    return ipKeyGenerator(req.ip || '127.0.0.1');
  },
  validate: {
    xForwardedForHeader: false,
    keyGeneratorIpFallback: false,
    default: true,
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Developer API rate limit exceeded (60 requests per minute). Please throttle requests.',
    },
  },
});
