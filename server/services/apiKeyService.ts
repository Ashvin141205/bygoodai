/**
 * ByGoodAI Server - Developer API Key Service
 * Cryptographically secure generation, SHA-256 hashing, verification, and revocation.
 * Raw API keys are never stored in plaintext and are shown exactly once upon creation.
 */

import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { PLAN_LIMITS, DEVELOPER_API_CONFIG } from '../config/usageLimits';
import { AppError } from '../middleware/errorHandler';
import { toSafeUser, AuthenticatedUser } from '../lib/auth';

export interface CreateApiKeyParams {
  userId: string;
  name: string;
  expiresInDays?: number | null;
}

export interface ApiKeyItem {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  isRevoked: boolean;
  isExpired: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface CreateApiKeyResult {
  apiKey: ApiKeyItem;
  rawKey: string; // ONLY returned once upon creation
}

/**
 * Generate a cryptographically secure random API key
 */
export function generateRawKey(): { rawKey: string; prefix: string; hash: string } {
  const entropy = crypto.randomBytes(24).toString('hex'); // 48 chars
  const rawKey = `${DEVELOPER_API_CONFIG.KEY_PREFIX}${entropy}`;
  const prefix = `${DEVELOPER_API_CONFIG.KEY_PREFIX}${entropy.slice(0, 6)}...${entropy.slice(-4)}`;
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  return { rawKey, prefix, hash };
}

/**
 * Hash an incoming API key with SHA-256 for database lookup
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

/**
 * Create a new API key for a user with plan active key count enforcement
 */
export async function createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult> {
  const cleanName = (params.name || '').trim();
  if (!cleanName || cleanName.length < 2 || cleanName.length > 50) {
    throw new AppError('API key name must be between 2 and 50 characters.', 400, 'INVALID_KEY_NAME');
  }

  // Get user & plan limits
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, plan: true },
  });

  if (!user) {
    throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
  }

  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.FREE;

  // Count active (non-revoked, non-expired) keys
  const activeKeyCount = await prisma.apiKey.count({
    where: {
      userId: user.id,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  if (activeKeyCount >= limits.maxActiveApiKeys) {
    throw new AppError(
      `You have reached the maximum active API keys limit (${limits.maxActiveApiKeys}) for your ${limits.name}. Please revoke an unused key or upgrade your plan.`,
      403,
      'MAX_API_KEYS_REACHED'
    );
  }

  // Calculate optional expiration date
  let expiresAt: Date | null = null;
  if (params.expiresInDays && params.expiresInDays > 0) {
    expiresAt = new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000);
  }

  const { rawKey, prefix, hash } = generateRawKey();

  const record = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: cleanName,
      keyPrefix: prefix,
      keyHash: hash,
      expiresAt,
    },
  });

  return {
    rawKey,
    apiKey: formatApiKeyRecord(record),
  };
}

/**
 * List all API keys belonging to a user (excludes key hashes)
 */
export async function listUserApiKeys(userId: string): Promise<ApiKeyItem[]> {
  const records = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return records.map(formatApiKeyRecord);
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(userId: string, keyId: string): Promise<ApiKeyItem> {
  const existing = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!existing) {
    throw new AppError('API key not found or you do not have permission to revoke it.', 404, 'KEY_NOT_FOUND');
  }

  if (existing.revokedAt) {
    return formatApiKeyRecord(existing);
  }

  const updated = await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  return formatApiKeyRecord(updated);
}

/**
 * Verify incoming Bearer API key against PostgreSQL hash store
 */
export async function verifyApiKey(rawKey: string): Promise<{
  apiKey: any;
  user: AuthenticatedUser;
}> {
  if (!rawKey || typeof rawKey !== 'string') {
    throw new AppError('API key is required in Authorization header: Bearer <API_KEY>', 401, 'INVALID_API_KEY');
  }

  const cleanKey = rawKey.trim();
  if (!cleanKey.startsWith(DEVELOPER_API_CONFIG.KEY_PREFIX)) {
    throw new AppError('Malformed API key. Expected format: osk_live_xxxxxxxx', 401, 'INVALID_API_KEY');
  }

  const hash = hashApiKey(cleanKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!apiKey || !apiKey.user) {
    throw new AppError('The provided API key does not exist or has been deleted.', 401, 'INVALID_API_KEY');
  }

  if (apiKey.revokedAt) {
    throw new AppError('This API key has been revoked and can no longer be used.', 401, 'REVOKED_API_KEY');
  }

  if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now()) {
    throw new AppError('This API key has expired. Please generate a new key.', 401, 'EXPIRED_API_KEY');
  }

  // Update lastUsedAt asynchronously
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((err) => console.warn('[ApiKeyService] Failed to update lastUsedAt:', err));

  return {
    apiKey,
    user: toSafeUser(apiKey.user),
  };
}

/**
 * Helper to compute calculated fields for API key responses
 */
function formatApiKeyRecord(record: any): ApiKeyItem {
  const isRevoked = Boolean(record.revokedAt);
  const isExpired = Boolean(record.expiresAt && new Date(record.expiresAt).getTime() < Date.now());

  let status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' = 'ACTIVE';
  if (isRevoked) status = 'REVOKED';
  else if (isExpired) status = 'EXPIRED';

  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    keyPrefix: record.keyPrefix,
    lastUsedAt: record.lastUsedAt ? new Date(record.lastUsedAt).toISOString() : null,
    expiresAt: record.expiresAt ? new Date(record.expiresAt).toISOString() : null,
    createdAt: new Date(record.createdAt).toISOString(),
    revokedAt: record.revokedAt ? new Date(record.revokedAt).toISOString() : null,
    isRevoked,
    isExpired,
    status,
  };
}
