/**
 * ByGoodAI Server - Tool Metadata & Analytics Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ALL_TOOLS, getToolBySlug } from '../../src/services/toolRegistry';

export const toolsRouter = Router();

/**
 * GET /api/tools
 * Returns tools with real usage analytics merged from PostgreSQL if available
 */
toolsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let executionStats: Record<string, number> = {};

    try {
      // Aggregate execution counts from PostgreSQL
      const counts = await prisma.toolExecution.groupBy({
        by: ['toolSlug'],
        _count: {
          id: true,
        },
      });

      executionStats = counts.reduce((acc, curr) => {
        acc[curr.toolSlug] = curr._count.id;
        return acc;
      }, {} as Record<string, number>);
    } catch {
      // Gracefully continue with static defaults if DB is temporarily disconnected
    }

    const toolsWithAnalytics = ALL_TOOLS.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      category: t.category,
      icon: t.icon,
      tags: t.tags,
      isPopular: t.isPopular,
      isNew: t.isNew,
      isPro: t.isPro,
      usageCount: (executionStats[t.slug] || 0) + t.usageCount,
      rating: t.rating,
      averageExecutionMs: t.averageExecutionMs,
    }));

    return res.json({
      success: true,
      data: toolsWithAnalytics,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tools/:slug
 * Returns specific tool definition with server-side metrics
 */
toolsRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const tool = getToolBySlug(slug);

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool with slug "${slug}" does not exist in registry.`,
        },
      });
    }

    let dbExecutionCount = 0;
    try {
      dbExecutionCount = await prisma.toolExecution.count({
        where: { toolSlug: slug },
      });
    } catch {
      // Ignore DB errors
    }

    return res.json({
      success: true,
      data: {
        ...tool,
        usageCount: tool.usageCount + dbExecutionCount,
      },
    });
  } catch (err) {
    next(err);
  }
});
