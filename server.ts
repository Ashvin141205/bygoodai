/**
 * ByGoodAI Platform - Express Backend Server & Vite Integration
 * Production-ready server orchestrating API routes, security middleware, Prisma data layer, and Vite SPA serving
 */

import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { seoRouter } from './server/routes/seo.routes';
import { requestIdMiddleware } from './server/middleware/requestId';
import { standardLimiter } from './server/middleware/rateLimiter';
import { csrfProtection } from './server/middleware/csrfProtection';
import { errorHandler } from './server/middleware/errorHandler';
import { prisma } from './server/lib/prisma';

dotenv.config();

const PORT = 3000;
const HOST = '0.0.0.0';

/**
 * Parses and resolves configured CORS allowed origins from environment
 */
function getResolvedAllowedOrigins(): string[] {
  const origins = new Set<string>();

  const candidates = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    process.env.CLIENT_ORIGIN,
    process.env.APP_URL,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'string') {
      const parts = candidate.split(',').map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (p !== '*') {
          try {
            const parsed = new URL(p);
            origins.add(parsed.origin);
          } catch {
            origins.add(p);
          }
        }
      }
    }
  }

  return Array.from(origins);
}

async function bootstrap() {
  const app = express();

  // Trust proxy for reverse proxy in Cloud Run, Kubernetes, Nginx, or Load Balancers
  app.set('trust proxy', 1);

  // Global Request ID for tracing and error correlation
  app.use(requestIdMiddleware);

  // 1. Production-Safe Security Headers via Helmet
  const isProduction = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for Razorpay dynamic checkout loader and Vite bundle initialization
                'https://checkout.razorpay.com',
              ],
              frameSrc: [
                "'self'",
                'https://api.razorpay.com',
                'https://checkout.razorpay.com',
              ],
              frameAncestors: [
                "'self'",
                'https://*.google.com',
                'https://*.run.app',
                'https://ai.studio',
              ],
              connectSrc: [
                "'self'",
                'https://api.razorpay.com',
                'https://lumberjack.razorpay.com',
                'https://generativelanguage.googleapis.com',
              ],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
              objectSrc: ["'none'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Frameguard disabled in favor of granular CSP frame-ancestors allowing AI Studio preview
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xContentTypeOptions: true,
    })
  );

  // 2. Production CORS Configuration
  const allowedOrigins = getResolvedAllowedOrigins();
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl, same-origin SPA)
        if (!requestOrigin) {
          return callback(null, true);
        }

        // If specific origins are configured in production
        if (allowedOrigins.length > 0) {
          if (allowedOrigins.includes(requestOrigin)) {
            return callback(null, true);
          }
          if (isProduction) {
            return callback(new Error(`CORS origin "${requestOrigin}" is not allowed by policy.`));
          }
        }

        // If no explicit origin set in dev/preview, reflect the request origin safely
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-dev-user-id', 'x-razorpay-signature', 'x-request-id'],
    })
  );

  // 3. Request Parsing, Cookies & Rate Limiting
  app.use(cookieParser());
  app.use(
    express.json({
      limit: '5mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use('/api', standardLimiter);
  app.use('/api', csrfProtection);

  // 4. Mount Backend API Routes & Direct SEO Routes FIRST
  app.use('/api', apiRouter);
  app.use('/', seoRouter);

  // 5. Vite Middleware for Development / Static serving for Production
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[ByGoodAI Server] Vite development middleware mounted.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[ByGoodAI Server] Production static assets serving from dist/.');
  }

  // 6. Central Error Handler Middleware
  app.use(errorHandler);

  // 7. Start HTTP Listener
  const server = app.listen(PORT, HOST, () => {
    console.log(`[ByGoodAI Server] Listening on http://${HOST}:${PORT} (Environment: ${process.env.NODE_ENV || 'development'})`);
  });

  // 8. Graceful Process Shutdown Handler
  const handleShutdown = async (signal: string) => {
    console.log(`[ByGoodAI Server] Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('[ByGoodAI Server] HTTP listener closed. Disconnecting Prisma database pool...');
      try {
        await prisma.$disconnect();
        console.log('[ByGoodAI Server] Prisma disconnected successfully. Exiting process.');
        process.exit(0);
      } catch (err) {
        console.error('[ByGoodAI Server] Error disconnecting Prisma during shutdown:', err);
        process.exit(1);
      }
    });

    // Fallback force shutdown if connections hang after 10s
    setTimeout(() => {
      console.error('[ByGoodAI Server] Graceful shutdown timed out. Forcing process exit.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  return { app, server };
}

bootstrap().catch((err) => {
  console.error('[ByGoodAI Server] Fatal error during startup:', err);
  process.exit(1);
});
