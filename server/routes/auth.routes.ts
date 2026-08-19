/**
 * ByGoodAI Server - Authentication & Account Management API Routes
 * Endpoints for registration, session login, logout, current user inspection,
 * password modification, and profile preference management.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  destroyAllUserSessions,
  setSessionCookie,
  clearSessionCookie,
  extractSessionToken,
  toSafeUser,
  findUserByEmail,
  findUserById,
  createUser,
  isMemoryFallbackAllowed,
  AuthenticatedUser,
  _memoryAuthStore,
} from '../lib/auth';
import { requireAuth, optionalAuth, requireAdmin } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

/**
 * GET /api/auth/admin-check
 * Strictly verifies Administrator privileges. Rejects non-admin users with 403.
 */
authRouter.get('/admin-check', requireAdmin, async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      authorized: true,
      user: req.user,
      message: 'Admin authorization verified',
    },
  });
});

// Validation Schemas
const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Za-z]/, 'New password must contain at least one letter')
      .regex(/[0-9]/, 'New password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation do not match',
    path: ['confirmPassword'],
  });

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  preferences: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/auth/register
 * Creates a new user account, assigns default FREE plan and USER role,
 * generates a secure session, and sets the HTTP-only session cookie.
 */
authRouter.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check for existing email in Prisma Database
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // 2. Hash Password with bcrypt work factor 12
    const passwordHash = await hashPassword(password);

    // 3. Persist to PostgreSQL via Prisma transaction
    const createdUser = await createUser({
      email: normalizedEmail,
      passwordHash,
      name,
    });

    const createdSafeUser = toSafeUser(createdUser);

    // 4. Create Session and set HTTP-only cookie
    const { sessionToken, expiresAt } = await createSession(createdSafeUser.id, req);
    setSessionCookie(res, sessionToken, expiresAt);

    return res.status(201).json({
      success: true,
      data: {
        user: createdSafeUser,
        message: 'Account registered successfully',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Validates credentials with constant-time security and creates an active session.
 */
authRouter.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);

    // Generic error to prevent user enumeration
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Create session and set cookie
    const { sessionToken, expiresAt } = await createSession(user.id, req);
    setSessionCookie(res, sessionToken, expiresAt);

    const safeUser = toSafeUser(user);

    return res.json({
      success: true,
      data: {
        user: safeUser,
        message: 'Signed in successfully',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Revokes current session and clears the HTTP-only cookie.
 */
authRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractSessionToken(req);
    if (token) {
      await destroySession(token);
    }

    clearSessionCookie(res);

    return res.json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user context from verified session (or null if guest).
 */
authRouter.get('/me', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      success: true,
      data: {
        user: req.user || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/change-password
 * Verifies current password, writes newly hashed password, and revokes other sessions.
 */
authRouter.post('/change-password', requireAuth, authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await findUserById(userId);

    if (!user || !user.passwordHash) {
      throw new AppError('User record not found', 404, 'NOT_FOUND');
    }

    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new AppError('The current password entered is incorrect', 400, 'INCORRECT_CURRENT_PASSWORD');
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      });
    } catch {
      if (isMemoryFallbackAllowed()) {
        if (user) {
          user.passwordHash = newHash;
          user.updatedAt = new Date();
        }
      } else {
        throw new AppError('Failed to update password in database', 500, 'DATABASE_ERROR');
      }
    }

    // Invalidate all other sessions except current
    const currentToken = extractSessionToken(req);
    await destroyAllUserSessions(userId, currentToken || undefined);

    return res.json({
      success: true,
      data: {
        message: 'Password changed successfully. All other active sessions have been signed out.',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/auth/profile
 * Updates authenticated user profile details and UI preferences.
 */
authRouter.patch('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validated = updateProfileSchema.parse(req.body);

    let updatedUser: any = null;

    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: validated.name !== undefined ? validated.name : undefined,
          avatarUrl: validated.avatarUrl !== undefined ? validated.avatarUrl : undefined,
          profile: {
            upsert: {
              create: {
                displayName: validated.name || undefined,
                bio: validated.bio || undefined,
                preferences: (validated.preferences as any) || {},
              },
              update: {
                displayName: validated.name !== undefined ? validated.name : undefined,
                bio: validated.bio !== undefined ? validated.bio : undefined,
                preferences: validated.preferences !== undefined ? (validated.preferences as any) : undefined,
              },
            },
          },
        },
        include: {
          profile: true,
        },
      });
    } catch {
      if (isMemoryFallbackAllowed()) {
        const memUser = _memoryAuthStore.findUserById(userId);
        if (memUser) {
          if (validated.name !== undefined) memUser.name = validated.name;
          if (validated.avatarUrl !== undefined) memUser.avatarUrl = validated.avatarUrl;
          if (memUser.profile) {
            if (validated.bio !== undefined) memUser.profile.bio = validated.bio;
            if (validated.preferences !== undefined) memUser.profile.preferences = validated.preferences;
          }
          updatedUser = memUser;
        }
      } else {
        throw new AppError('Failed to update profile in database', 500, 'DATABASE_ERROR');
      }
    }

    if (!updatedUser) {
      throw new AppError('Unable to update user profile', 400, 'UPDATE_FAILED');
    }

    return res.json({
      success: true,
      data: {
        user: toSafeUser(updatedUser),
        message: 'Profile updated successfully',
      },
    });
  } catch (err) {
    next(err);
  }
});
