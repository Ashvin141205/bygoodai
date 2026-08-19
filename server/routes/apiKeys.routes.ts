/**
 * ByGoodAI Server - API Key Management Routes
 * Allows authenticated users to create, list, and revoke Developer API Keys.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware';
import { writeLimiter } from '../middleware/rateLimiter';
import { createApiKey, listUserApiKeys, revokeApiKey } from '../services/apiKeyService';

export const apiKeysRouter = Router();

const createKeySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  expiresInDays: z.number().int().min(1).max(365).optional().nullable(),
});

/**
 * GET /api/api-keys
 * List all API keys belonging to the authenticated user
 */
apiKeysRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keys = await listUserApiKeys(req.user!.id);
    return res.json({
      success: true,
      data: keys,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/api-keys
 * Generates a new API key. Raw key is returned EXACTLY ONCE.
 */
apiKeysRouter.post('/', requireAuth, writeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createKeySchema.parse(req.body);
    const result = await createApiKey({
      userId: req.user!.id,
      name: validated.name,
      expiresInDays: validated.expiresInDays,
    });

    return res.status(201).json({
      success: true,
      data: {
        apiKey: result.apiKey,
        rawKey: result.rawKey,
        warning: 'This API key will never be displayed again. Please copy and store it securely.',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/api-keys/:id
 * Revoke an API key
 */
apiKeysRouter.delete('/:id', requireAuth, writeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const revoked = await revokeApiKey(req.user!.id, id);

    return res.json({
      success: true,
      data: revoked,
      message: 'API key successfully revoked.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/api-keys/:id/revoke
 * Alternative POST endpoint to revoke an API key
 */
apiKeysRouter.post('/:id/revoke', requireAuth, writeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const revoked = await revokeApiKey(req.user!.id, id);

    return res.json({
      success: true,
      data: revoked,
      message: 'API key successfully revoked.',
    });
  } catch (err) {
    next(err);
  }
});
