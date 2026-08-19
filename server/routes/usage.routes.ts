/**
 * ByGoodAI Server - Usage & Quota Metrics API Routes
 * Provides real-time plan consumption metrics, breakdown, and historical logs from PostgreSQL.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';
import { getUsageSummary } from '../services/usageService';
import { prisma } from '../lib/prisma';

export const usageRouter = Router();

/**
 * GET /api/usage
 * Returns monthly usage metrics, remaining quotas, and category percentages for the active user
 */
usageRouter.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      // Unauthenticated view returns free plan baseline defaults
      return res.json({
        success: true,
        data: {
          plan: 'FREE',
          used: 0,
          limit: 6050,
          remaining: 6050,
          period: 'monthly',
          periodStart: new Date().toISOString(),
          periodEnd: new Date().toISOString(),
          breakdown: {
            aiRequests: { used: 0, limit: 50, remaining: 50, percentage: 0 },
            apiRequests: { used: 0, limit: 1000, remaining: 1000, percentage: 0 },
            toolExecutions: { used: 0, limit: 5000, remaining: 5000, percentage: 0 },
          },
        },
      });
    }

    const summary = await getUsageSummary(user.id, user.plan);

    return res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/usage/history
 * Returns the 50 most recent usage records for the authenticated user
 */
usageRouter.get('/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await prisma.usageRecord.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        toolSlug: true,
        tokensUsed: true,
        inputTokens: true,
        outputTokens: true,
        executionTimeMs: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      data: records,
    });
  } catch (err) {
    next(err);
  }
});
