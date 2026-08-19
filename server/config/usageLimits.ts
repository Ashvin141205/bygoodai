/**
 * ByGoodAI Server - Centralized Usage, Quota & Rate Limit Configuration
 * Defines strict plan boundaries, token quotas, timeouts, and model parameters.
 */

export interface PlanLimits {
  name: string;
  maxActiveApiKeys: number;
  monthlyAiRequests: number;
  monthlyApiRequests: number;
  monthlyToolExecutions: number;
  apiRateLimitPerMinute: number;
  maxInputPayloadBytes: number;
  maxAiInputChars: number;
  maxAiOutputTokens: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    name: 'Free Plan',
    maxActiveApiKeys: 2,
    monthlyAiRequests: 50,
    monthlyApiRequests: 1000,
    monthlyToolExecutions: 5000,
    apiRateLimitPerMinute: 15,
    maxInputPayloadBytes: 256 * 1024, // 256 KB
    maxAiInputChars: 4000,
    maxAiOutputTokens: 1500,
  },
  PRO: {
    name: 'Pro Plan',
    maxActiveApiKeys: 10,
    monthlyAiRequests: 1000,
    monthlyApiRequests: 50000,
    monthlyToolExecutions: 50000,
    apiRateLimitPerMinute: 60,
    maxInputPayloadBytes: 5 * 1024 * 1024, // 5 MB
    maxAiInputChars: 16000,
    maxAiOutputTokens: 2500,
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    maxActiveApiKeys: 50,
    monthlyAiRequests: 10000,
    monthlyApiRequests: 500000,
    monthlyToolExecutions: 1000000,
    apiRateLimitPerMinute: 300,
    maxInputPayloadBytes: 25 * 1024 * 1024, // 25 MB
    maxAiInputChars: 64000,
    maxAiOutputTokens: 4000,
  },
};

export const AI_CONFIG = {
  DEFAULT_MODEL: 'gemini-3.7-flash',
  FALLBACK_MODEL: 'gemini-3.7-flash',
  TEMPERATURE: 0.3,
  MAX_OUTPUT_TOKENS: 1500,
  TIMEOUT_MS: 20000, // 20 seconds timeout
  MAX_RETRIES: 2,
};

export const DEVELOPER_API_CONFIG = {
  VERSION: 'v1',
  DEFAULT_PAGE_SIZE: 50,
  MAX_TOOL_TIMEOUT_MS: 10000, // 10 seconds execution timeout for tools
  KEY_PREFIX: 'osk_live_',
};
