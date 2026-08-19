/**
 * ByGoodAI Server - Authentication & Role Authorization Middleware
 * Strictly validates server-side sessions, attaches authenticated user context,
 * and enforces Role-Based Access Control (RBAC).
 */

import { Request, Response, NextFunction } from 'express';
import { getAuthenticatedUser, AuthenticatedUser } from '../lib/auth';
import { AppError } from './errorHandler';

// Augment Express Request interface with typed user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Enforces authenticated session.
 * Rejects unauthenticated requests with HTTP 401 UNAUTHORIZED.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      throw new AppError('Authentication required to access this resource', 401, 'UNAUTHORIZED');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Enforces Administrator role privileges on sensitive system and telemetry routes.
 * Rejects unauthorized users with HTTP 403 FORBIDDEN.
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    // 1. Ensure user is authenticated first
    let user = req.user;
    if (!user) {
      user = (await getAuthenticatedUser(req)) || undefined;
    }

    if (!user) {
      throw new AppError('Authentication required to access admin resources', 401, 'UNAUTHORIZED');
    }

    // 2. Strictly verify server-side role
    if (user.role !== 'ADMIN') {
      throw new AppError('Administrator privileges required to access this resource', 403, 'FORBIDDEN');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Attaches user to req.user if a valid session exists, but allows guests to proceed uninterrupted
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req);
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    // Proceed as unauthenticated guest
    next();
  }
}
