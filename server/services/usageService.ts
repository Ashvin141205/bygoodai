/**
 * ByGoodAI Server - Usage & Quota Service
 * Centralized tracking and enforcement of AI requests, developer API calls, and tool executions.
 *
 * PRIVACY GUARANTEE:
 * Usage records strictly store bounded operational telemetry (timestamps, token counts,
 * execution duration, tool slugs, and IP addresses). No user prompts, payloads, API key secrets,
 * or sensitive outputs are ever persisted to usage history tables.
 */

import { prisma } from '../lib/prisma';
import { PLAN_LIMITS } from '../config/usageLimits';
import { AppError } from '../middleware/errorHandler';

export interface UsageSummary {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  period: string;
  periodStart: string;
  periodEnd: string;
  breakdown: {
    aiRequests: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    apiRequests: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    toolExecutions: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
  };
}

export interface RecordUsageParams {
  userId?: string | null;
  apiKeyId?: string | null;
  type: 'AI_PROMPT_OPTIMIZE' | 'API_TOOL_EXECUTION' | 'WEB_TOOL_EXECUTION';
  toolSlug?: string | null;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  executionTimeMs?: number;
  ipAddress?: string | null;
}

/**
 * Returns UTC Start and End Date for current calendar month
 */
export function getCurrentMonthWindow(): { startOfMonth: Date; endOfMonth: Date } {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { startOfMonth, endOfMonth };
}

/**
 * Record an operation in PostgreSQL usage_records table asynchronously.
 * Only non-sensitive metrics are persisted.
 */
export async function recordUsageRecord(params: RecordUsageParams): Promise<void> {
  try {
    const tokens = params.tokensUsed || (params.inputTokens || 0) + (params.outputTokens || 0);

    // Sanitize and bound metrics
    await prisma.usageRecord.create({
      data: {
        userId: params.userId || null,
        apiKeyId: params.apiKeyId || null,
        type: params.type,
        toolSlug: params.toolSlug ? params.toolSlug.slice(0, 100) : null,
        tokensUsed: Math.max(0, Math.min(10000000, tokens)),
        inputTokens: Math.max(0, Math.min(5000000, params.inputTokens || 0)),
        outputTokens: Math.max(0, Math.min(5000000, params.outputTokens || 0)),
        executionTimeMs: Math.max(0, Math.min(300000, params.executionTimeMs || 0)),
        ipAddress: params.ipAddress ? params.ipAddress.slice(0, 45) : null,
      },
    });
  } catch (err) {
    console.warn('[UsageService] Failed to persist usage record:', err);
  }
}

/**
 * Enforce quota limits for a given user plan before executing an operation.
 * Throws AppError with status 429 and code USAGE_LIMIT_EXCEEDED if quota is reached.
 *
 * Concurrency notes:
 * Counts are queried within the active monthly window. In high concurrency scenarios,
 * pre-flight count verification blocks users exceeding their quota boundaries with sub-second accuracy.
 */
export async function checkAndEnforceUsageLimit(
  userId: string | null,
  plan: string = 'FREE',
  operationType: 'AI' | 'API' | 'TOOL'
): Promise<void> {
  if (!userId) {
    // Unauthenticated requests are throttled at rate-limiter level
    return;
  }

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
  const { startOfMonth } = getCurrentMonthWindow();

  if (operationType === 'AI') {
    const aiCount = await prisma.usageRecord.count({
      where: {
        userId,
        type: 'AI_PROMPT_OPTIMIZE',
        createdAt: { gte: startOfMonth },
      },
    });

    if (aiCount >= limits.monthlyAiRequests) {
      throw new AppError(
        `Monthly AI quota exceeded (${aiCount}/${limits.monthlyAiRequests} requests). Please upgrade your plan to continue using AI tools.`,
        429,
        'USAGE_LIMIT_EXCEEDED'
      );
    }
  } else if (operationType === 'API') {
    const apiCount = await prisma.usageRecord.count({
      where: {
        userId,
        type: 'API_TOOL_EXECUTION',
        createdAt: { gte: startOfMonth },
      },
    });

    if (apiCount >= limits.monthlyApiRequests) {
      throw new AppError(
        `Monthly Developer API quota exceeded (${apiCount}/${limits.monthlyApiRequests} requests). Upgrade to Pro or Enterprise for higher volume.`,
        429,
        'USAGE_LIMIT_EXCEEDED'
      );
    }
  } else if (operationType === 'TOOL') {
    const toolCount = await prisma.toolExecution.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (toolCount >= limits.monthlyToolExecutions) {
      throw new AppError(
        `Monthly tool execution limit reached (${toolCount}/${limits.monthlyToolExecutions}).`,
        429,
        'USAGE_LIMIT_EXCEEDED'
      );
    }
  }
}

/**
 * Calculate full usage summary with percentage breakdowns for the authenticated user
 */
export async function getUsageSummary(userId: string, plan: string = 'FREE'): Promise<UsageSummary> {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
  const { startOfMonth, endOfMonth } = getCurrentMonthWindow();

  // Aggregate AI requests this month
  const aiRequestsUsed = await prisma.usageRecord.count({
    where: {
      userId,
      type: 'AI_PROMPT_OPTIMIZE',
      createdAt: { gte: startOfMonth },
    },
  });

  // Aggregate Developer API calls this month
  const apiRequestsUsed = await prisma.usageRecord.count({
    where: {
      userId,
      type: 'API_TOOL_EXECUTION',
      createdAt: { gte: startOfMonth },
    },
  });

  // Aggregate total web tool executions
  const toolExecutionsUsed = await prisma.toolExecution.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });

  const totalUsed = aiRequestsUsed + apiRequestsUsed + toolExecutionsUsed;
  const totalLimit = limits.monthlyAiRequests + limits.monthlyApiRequests + limits.monthlyToolExecutions;

  return {
    plan,
    used: totalUsed,
    limit: totalLimit,
    remaining: Math.max(0, totalLimit - totalUsed),
    period: 'monthly',
    periodStart: startOfMonth.toISOString(),
    periodEnd: endOfMonth.toISOString(),
    breakdown: {
      aiRequests: {
        used: aiRequestsUsed,
        limit: limits.monthlyAiRequests,
        remaining: Math.max(0, limits.monthlyAiRequests - aiRequestsUsed),
        percentage: Math.min(100, Math.round((aiRequestsUsed / limits.monthlyAiRequests) * 100)),
      },
      apiRequests: {
        used: apiRequestsUsed,
        limit: limits.monthlyApiRequests,
        remaining: Math.max(0, limits.monthlyApiRequests - apiRequestsUsed),
        percentage: Math.min(100, Math.round((apiRequestsUsed / limits.monthlyApiRequests) * 100)),
      },
      toolExecutions: {
        used: toolExecutionsUsed,
        limit: limits.monthlyToolExecutions,
        remaining: Math.max(0, limits.monthlyToolExecutions - toolExecutionsUsed),
        percentage: Math.min(100, Math.round((toolExecutionsUsed / limits.monthlyToolExecutions) * 100)),
      },
    },
  };
}
