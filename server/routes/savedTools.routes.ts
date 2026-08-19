/**
 * ByGoodAI Server - Saved Tools (Bookmarks) API Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/authMiddleware';
import { writeLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

export const savedToolsRouter = Router();

const saveToolSchema = z.object({
  toolSlug: z.string().min(1).max(100),
  toolName: z.string().max(100).optional(),
});

/**
 * GET /api/saved-tools
 * Get all bookmarks for the authenticated user
 */
savedToolsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const saved = await prisma.savedTool.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/saved-tools
 * Bookmark a tool
 */
savedToolsRouter.post('/', requireAuth, writeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { toolSlug, toolName } = saveToolSchema.parse(req.body);

    const saved = await prisma.savedTool.upsert({
      where: {
        userId_toolSlug: {
          userId,
          toolSlug,
        },
      },
      update: {
        toolName: toolName || toolSlug,
      },
      create: {
        userId,
        toolSlug,
        toolName: toolName || toolSlug,
      },
    });

    return res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/saved-tools/:toolSlug
 * Remove a tool bookmark
 */
savedToolsRouter.delete('/:toolSlug', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { toolSlug } = req.params;

    const existing = await prisma.savedTool.findUnique({
      where: {
        userId_toolSlug: {
          userId,
          toolSlug,
        },
      },
    });

    if (!existing) {
      throw new AppError('Saved tool not found', 404, 'NOT_FOUND');
    }

    await prisma.savedTool.delete({
      where: {
        userId_toolSlug: {
          userId,
          toolSlug,
        },
      },
    });

    return res.json({
      success: true,
      data: { message: `Removed "${toolSlug}" from bookmarks` },
    });
  } catch (err) {
    next(err);
  }
});
