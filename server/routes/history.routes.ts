/**
 * ByGoodAI Server - Tool Execution History API Routes
 * Persistent history recording with user isolation and privacy snippet bounds
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/authMiddleware';
import { writeLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

export const historyRouter = Router();

const createHistorySchema = z.object({
  toolSlug: z.string().min(1).max(100),
  toolName: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  status: z.enum(['SUCCESS', 'ERROR', 'TIMEOUT']).default('SUCCESS'),
  executionTimeMs: z.number().int().min(0).max(300000).default(0),
  inputSnippet: z.string().max(300).optional(),
  outputSnippet: z.string().max(300).optional(),
});

/**
 * GET /api/history
 * Retrieve current user's persistent execution history
 */
historyRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const history = await prisma.toolExecution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        toolSlug: true,
        toolName: true,
        category: true,
        status: true,
        executionTimeMs: true,
        inputSnippet: true,
        outputSnippet: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/history
 * Record a bounded execution result in PostgreSQL
 */
historyRouter.post('/', requireAuth, writeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validated = createHistorySchema.parse(req.body);

    const record = await prisma.toolExecution.create({
      data: {
        userId,
        toolSlug: validated.toolSlug,
        toolName: validated.toolName || validated.toolSlug,
        category: validated.category || 'developer',
        status: validated.status,
        executionTimeMs: validated.executionTimeMs,
        inputSnippet: validated.inputSnippet ? validated.inputSnippet.slice(0, 150) : null,
        outputSnippet: validated.outputSnippet ? validated.outputSnippet.slice(0, 150) : null,
      },
    });

    return res.status(201).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/history/:id
 * Delete a specific history entry owned by the authenticated user
 */
historyRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.toolExecution.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('History record not found or unauthorized', 404, 'NOT_FOUND');
    }

    await prisma.toolExecution.delete({
      where: { id },
    });

    return res.json({
      success: true,
      data: { message: 'History record deleted successfully' },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/history
 * Clear entire history for authenticated user
 */
historyRouter.delete('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const result = await prisma.toolExecution.deleteMany({
      where: { userId },
    });

    return res.json({
      success: true,
      data: { deletedCount: result.count },
    });
  } catch (err) {
    next(err);
  }
});
