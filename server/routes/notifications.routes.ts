/**
 * ByGoodAI Server - User Notifications API Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export const notificationsRouter = Router();

/**
 * GET /api/notifications
 * Retrieve user's system and activity notifications
 */
notificationsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
notificationsRouter.patch('/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});
