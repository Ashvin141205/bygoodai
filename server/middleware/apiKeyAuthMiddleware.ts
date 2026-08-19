/**
 * ByGoodAI Server - Developer API Key Authentication Middleware
 * Validates incoming Bearer API keys, authenticates the developer identity,
 * and enforces usage quotas before tool execution.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyApiKey } from '../services/apiKeyService';
import { checkAndEnforceUsageLimit } from '../services/usageService';
import { AppError } from './errorHandler';

// Extend Express Request interface for API key authentication
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: string;
        name: string;
        keyPrefix: string;
      };
      isApiKeyAuth?: boolean;
    }
  }
}

/**
 * Middleware that strictly requires a valid Developer API Key.
 * Extracts token from 'Authorization: Bearer <API_KEY>' or 'x-api-key' header.
 */
export async function requireApiKey(req: Request, _res: Response, next: NextFunction) {
  try {
    let rawKey: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      rawKey = authHeader.substring(7).trim();
    } else if (req.headers['x-api-key'] && typeof req.headers['x-api-key'] === 'string') {
      rawKey = req.headers['x-api-key'].trim();
    }

    if (!rawKey) {
      return next(
        new AppError(
          'Authentication required. Please provide a valid developer API key via Authorization: Bearer <API_KEY> header.',
          401,
          'INVALID_API_KEY'
        )
      );
    }

    // 1. Verify key cryptographic hash in PostgreSQL
    const { apiKey, user } = await verifyApiKey(rawKey);

    // 2. Check and enforce monthly Developer API usage quota
    await checkAndEnforceUsageLimit(user.id, user.plan, 'API');

    // 3. Attach authenticated identity to request context
    req.apiKey = {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
    };

    req.user = user;

    req.isApiKeyAuth = true;

    return next();
  } catch (err) {
    return next(err);
  }
}
