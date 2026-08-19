/**
 * ByGoodAI Server - Developer API V1 Router
 * Mounts tools, AI endpoints, and API discovery manifest under /api/v1
 */

import { Router, Request, Response } from 'express';
import { toolsV1Router } from './tools.v1.routes';
import { aiV1Router } from './ai.v1.routes';

export const v1Router = Router();

/**
 * GET /api/v1
 * Developer API discovery & manifest
 */
v1Router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'ByGoodAI Developer API',
      version: 'v1',
      status: 'operational',
      documentation: '/docs',
      endpoints: {
        tools: {
          list: 'GET /api/v1/tools',
          get: 'GET /api/v1/tools/:slug',
          execute: 'POST /api/v1/tools/:slug',
        },
        ai: {
          promptOptimize: 'POST /api/v1/ai/prompt-optimize',
        },
      },
      authentication: {
        type: 'Bearer API Key',
        header: 'Authorization: Bearer <API_KEY>',
        alternativeHeader: 'x-api-key: <API_KEY>',
      },
    },
  });
});

// Mount V1 Sub-routes
v1Router.use('/tools', toolsV1Router);
v1Router.use('/ai', aiV1Router);
