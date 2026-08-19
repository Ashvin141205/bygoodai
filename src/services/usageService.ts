/**
 * ByGoodAI Client - Usage & Quota Metrics Service
 */

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

export interface UsageHistoryRecord {
  id: string;
  type: string;
  toolSlug: string | null;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  executionTimeMs: number;
  createdAt: string;
}

export const usageClientService = {
  /**
   * Fetch current month's usage summary and breakdown
   */
  async getUsage(): Promise<UsageSummary> {
    const res = await fetch('/api/usage', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch usage metrics.');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch recent usage records
   */
  async getHistory(): Promise<UsageHistoryRecord[]> {
    const res = await fetch('/api/usage/history', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch usage history.');
    }

    const json = await res.json();
    return json.data || [];
  },
};
