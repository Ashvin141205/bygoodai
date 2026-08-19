/**
 * ByGoodAI Server - Real Authentication & Session Core
 * Robust password hashing (bcryptjs salt 12), secure token generation,
 * session lifecycle management, HTTP-only cookie utilities, and safe user projection.
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { AppError } from '../middleware/errorHandler';

export const SESSION_COOKIE_NAME = 'bygoodai_session';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Validates and retrieves server-side AUTH_SECRET.
 * Fails fast if AUTH_SECRET is not configured.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !secret.trim()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL CONFIGURATION ERROR: AUTH_SECRET environment variable is required in production.');
    }
    throw new Error('AUTH_SECRET environment variable is required. Please set AUTH_SECRET in your .env file.');
  }
  return secret;
}

/**
 * Explicit flag controlling in-memory fallback.
 * Strictly FALSE by default. Never permitted in production.
 */
export function isMemoryFallbackAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return process.env.AUTH_ALLOW_MEMORY_FALLBACK === 'true';
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  emailVerified?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    displayName?: string | null;
    bio?: string | null;
    preferences?: any;
  } | null;
}

// In-memory fallback session cache only used if AUTH_ALLOW_MEMORY_FALLBACK=true in dev/test
interface MemorySession {
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface MemoryUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  passwordHash: string;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    displayName: string | null;
    bio: string | null;
    preferences: any;
  };
}

const memoryUsers: Map<string, MemoryUser> = new Map();
const memorySessions: Map<string, MemorySession> = new Map();

/**
 * Hash plain text password using bcrypt with work factor 12
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plain text password against stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sets secure HTTP-only session cookie on the response
 */
export function setSessionCookie(res: Response, sessionToken: string, expiresAt: Date) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/**
 * Clears the session cookie on logout or session expiration
 */
export function clearSessionCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
}

/**
 * Extracts raw session token from HTTP-only cookie or Authorization header
 */
export function extractSessionToken(req: Request): string | null {
  // 1. Try HTTP-only cookie first (Primary)
  if (req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    const token = req.cookies[SESSION_COOKIE_NAME];
    if (typeof token === 'string' && token.trim()) {
      return token.trim();
    }
  }

  // 2. Try Authorization Bearer header (For API testbed / headless clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  return null;
}

/**
 * Formats a raw user record into a safe client projection (never returns password hashes)
 */
export function toSafeUser(user: any): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: (user.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN',
    plan: (user.plan === 'ENTERPRISE' ? 'ENTERPRISE' : user.plan === 'PRO' ? 'PRO' : 'FREE') as 'FREE' | 'PRO' | 'ENTERPRISE',
    emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString(),
    profile: user.profile
      ? {
          displayName: user.profile.displayName ?? null,
          bio: user.profile.bio ?? null,
          preferences: user.profile.preferences ?? {},
        }
      : null,
  };
}

/**
 * Find user by email in PostgreSQL (or memory fallback if allowed in tests)
 */
export async function findUserByEmail(email: string): Promise<any | null> {
  const normalized = email.trim().toLowerCase();
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      include: { profile: true },
    });
    return user;
  } catch (err) {
    if (isMemoryFallbackAllowed()) {
      return memoryUsers.get(normalized) || null;
    }
    throw new AppError(
      'DATABASE_URL is not connected to a PostgreSQL database. Database connection required.',
      503,
      'DATABASE_UNAVAILABLE'
    );
  }
}

/**
 * Find user by ID in PostgreSQL (or memory fallback if allowed in tests)
 */
export async function findUserById(id: string): Promise<any | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    return user;
  } catch (err) {
    if (isMemoryFallbackAllowed()) {
      return memoryUsers.get(id) || null;
    }
    throw new AppError(
      'DATABASE_URL is not connected to a PostgreSQL database. Database connection required.',
      503,
      'DATABASE_UNAVAILABLE'
    );
  }
}

/**
 * Create a new user with default USER role, FREE plan, profile, and welcome notification
 */
export async function createUser(params: {
  email: string;
  passwordHash: string;
  name?: string;
}): Promise<any> {
  const normalized = params.email.trim().toLowerCase();
  const userId = 'usr_' + crypto.randomBytes(12).toString('hex');

  try {
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email: normalized,
          name: params.name || null,
          passwordHash: params.passwordHash,
          role: 'USER',
          plan: 'FREE',
          profile: {
            create: {
              displayName: params.name || null,
              preferences: {
                theme: 'system',
                emailNotifications: true,
                autoSaveHistory: true,
                compactView: false,
              },
            },
          },
        },
        include: {
          profile: true,
        },
      });

      await tx.notification.create({
        data: {
          userId: newUser.id,
          title: 'Welcome to ByGoodAI Platform',
          message: 'Your developer account is ready. Explore developer utilities with local browser execution.',
          type: 'INFO',
          actionUrl: '/tools',
        },
      });

      return newUser;
    });

    return user;
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    if (!isMemoryFallbackAllowed()) {
      throw new AppError(
        'DATABASE_URL is not connected to a PostgreSQL database. Failed to persist user.',
        503,
        'DATABASE_UNAVAILABLE'
      );
    }

    const now = new Date();
    const memUser: MemoryUser = {
      id: userId,
      email: normalized,
      name: params.name || null,
      avatarUrl: null,
      role: 'USER',
      plan: 'FREE',
      passwordHash: params.passwordHash,
      emailVerified: null,
      createdAt: now,
      updatedAt: now,
      profile: {
        displayName: params.name || null,
        bio: null,
        preferences: {
          theme: 'system',
          emailNotifications: true,
          autoSaveHistory: true,
          compactView: false,
        },
      },
    };
    memoryUsers.set(memUser.id, memUser);
    memoryUsers.set(memUser.email.toLowerCase(), memUser);
    return memUser;
  }
}

/**
 * Creates a persistent session in PostgreSQL
 */
export async function createSession(
  userId: string,
  req?: Request
): Promise<{ sessionToken: string; expiresAt: Date }> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const rawIp = (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req?.ip || req?.socket.remoteAddress || undefined;
  const rawAgent = req?.headers['user-agent'] || undefined;

  try {
    await prisma.session.create({
      data: {
        sessionToken,
        userId,
        expiresAt,
        ipAddress: rawIp ? rawIp.slice(0, 100) : undefined,
        userAgent: rawAgent ? rawAgent.slice(0, 255) : undefined,
      },
    });
  } catch (err: any) {
    if (!isMemoryFallbackAllowed()) {
      throw new AppError(
        'Database session creation failed: PostgreSQL connection is required. (DATABASE_URL is not connected)',
        503,
        'DATABASE_UNAVAILABLE'
      );
    }
    // Save to memory cache only when explicitly allowed in dev/test
    memorySessions.set(sessionToken, {
      token: sessionToken,
      userId,
      expiresAt,
      ipAddress: rawIp,
      userAgent: rawAgent,
    });
  }

  return { sessionToken, expiresAt };
}

/**
 * Retrieves a session with user information from PostgreSQL
 */
export async function getSession(sessionToken: string): Promise<any | null> {
  if (!sessionToken) return null;
  const now = new Date();

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (session) {
      if (session.expiresAt <= now) {
        prisma.session.deleteMany({ where: { sessionToken } }).catch(() => {});
        return null;
      }
      return session;
    }
    return null;
  } catch {
    if (isMemoryFallbackAllowed()) {
      const memSession = memorySessions.get(sessionToken);
      if (memSession) {
        if (memSession.expiresAt <= now) {
          memorySessions.delete(sessionToken);
          return null;
        }
        const user = memoryUsers.get(memSession.userId);
        if (user) {
          return { ...memSession, user };
        }
      }
    }
    return null;
  }
}

/**
 * Revokes and deletes a session token from PostgreSQL
 */
export async function destroySession(sessionToken: string): Promise<void> {
  if (!sessionToken) return;

  if (isMemoryFallbackAllowed()) {
    memorySessions.delete(sessionToken);
  }

  try {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
  } catch (err) {
    if (!isMemoryFallbackAllowed()) {
      throw new AppError('Failed to revoke session in PostgreSQL database', 500, 'DATABASE_ERROR');
    }
  }
}

/**
 * Revokes all sessions for a user (e.g., upon password change), optionally preserving current session
 */
export async function destroyAllUserSessions(userId: string, exceptToken?: string): Promise<void> {
  if (isMemoryFallbackAllowed()) {
    for (const [token, sess] of memorySessions.entries()) {
      if (sess.userId === userId && token !== exceptToken) {
        memorySessions.delete(token);
      }
    }
  }

  try {
    if (exceptToken) {
      await prisma.session.deleteMany({
        where: {
          userId,
          sessionToken: { not: exceptToken },
        },
      });
    } else {
      await prisma.session.deleteMany({
        where: { userId },
      });
    }
  } catch (err) {
    if (!isMemoryFallbackAllowed()) {
      throw new AppError('Failed to revoke sessions in PostgreSQL database', 500, 'DATABASE_ERROR');
    }
  }
}

/**
 * Extracts and verifies the authenticated user from the request session.
 * Rejects expired or forged sessions.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const token = extractSessionToken(req);
  if (!token) return null;

  const session = await getSession(token);
  if (session && session.user) {
    return toSafeUser(session.user);
  }

  return null;
}

// Memory fallback user helpers for explicit test modes
export const _memoryAuthStore = {
  users: memoryUsers,
  sessions: memorySessions,
  addUser(user: MemoryUser) {
    memoryUsers.set(user.id, user);
    memoryUsers.set(user.email.toLowerCase(), user);
  },
  findUserByEmail(email: string): MemoryUser | undefined {
    return memoryUsers.get(email.toLowerCase());
  },
  findUserById(id: string): MemoryUser | undefined {
    return memoryUsers.get(id);
  },
  clear() {
    memoryUsers.clear();
    memorySessions.clear();
  },
};

