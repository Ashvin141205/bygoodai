/**
 * ByGoodAI Server - Health & Readiness Diagnostics Routes
 */

import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../lib/prisma';

export const healthRouter = Router();
export const readyRouter = Router();

/**
 * GET /api/health
 * Safe operational health check reporting status, uptime, and system telemetry without exposing secrets
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  const memoryUsage = process.memoryUsage();

  const isHealthy = dbHealth.connected;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealth.connected ? 'connected' : 'disconnected',
        latencyMs: dbHealth.latencyMs,
        ...(dbHealth.message && { note: dbHealth.message }),
      },
      system: {
        memoryHeapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        memoryHeapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
    },
  });
});

/**
 * GET /api/ready
 * Strict readiness probe for orchestrators (Cloud Run, Kubernetes, reverse proxies).
 * Returns HTTP 200 when all core production dependencies are connected and configured.
 * Returns HTTP 503 when critical production dependencies (PostgreSQL) are unreachable.
 */
readyRouter.get('/', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.trim());
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasRazorpayKeys = Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_WEBHOOK_SECRET
  );

  // In production, database is a hard blocker for readiness
  const isReady = dbHealth.connected && (process.env.NODE_ENV !== 'production' || hasAuthSecret);

  const checks = {
    database: dbHealth.connected ? 'READY' : 'UNAVAILABLE',
    authSecret: hasAuthSecret ? 'CONFIGURED' : 'MISSING',
    geminiApi: hasGeminiKey ? 'CONFIGURED' : 'OPTIONAL_UNCONFIGURED',
    razorpayBilling: hasRazorpayKeys ? 'CONFIGURED' : 'OPTIONAL_UNCONFIGURED',
  };

  if (!isReady) {
    return res.status(503).json({
      success: false,
      ready: false,
      error: {
        code: 'SERVICE_NOT_READY',
        message: 'Service is not ready to accept traffic due to unready core dependencies.',
        checks,
      },
    });
  }

  return res.status(200).json({
    success: true,
    ready: true,
    data: {
      status: 'READY',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks,
    },
  });
});

