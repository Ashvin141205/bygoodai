/**
 * ByGoodAI Server - Central API Route Aggregator
 */

import { Router } from 'express';
import { healthRouter, readyRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { toolsRouter } from './tools.routes';
import { historyRouter } from './history.routes';
import { savedToolsRouter } from './savedTools.routes';
import { notificationsRouter } from './notifications.routes';
import { blogRouter } from './blog.routes';
import { aiRouter } from './ai.routes';
import { apiKeysRouter } from './apiKeys.routes';
import { usageRouter } from './usage.routes';
import { billingRouter } from './billing.routes';
import { v1Router } from './v1';
import { AppError } from '../middleware/errorHandler';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/ready', readyRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/tools', toolsRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/saved-tools', savedToolsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/blog', blogRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/api-keys', apiKeysRouter);
apiRouter.use('/usage', usageRouter);
apiRouter.use('/billing', billingRouter);
apiRouter.use('/v1', v1Router);

// Catch-all 404 handler for unknown /api/* endpoints
apiRouter.use('*', (req, _res, next) => {
  next(new AppError(`API endpoint "${req.method} ${req.originalUrl}" not found`, 404, 'RESOURCE_NOT_FOUND'));
});
