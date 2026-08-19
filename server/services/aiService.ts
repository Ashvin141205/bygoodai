/**
 * ByGoodAI Server - Production AI Service
 * Encapsulates Gemini SDK operations with timeout, rate limiting, error classification, and usage tracking.
 * Strictly server-side: GEMINI_API_KEY is never exposed to browser bundles.
 */

import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG, PLAN_LIMITS } from '../config/usageLimits';
import { checkAndEnforceUsageLimit, recordUsageRecord } from './usageService';
import { AppError } from '../middleware/errorHandler';

let aiClient: GoogleGenAI | null = null;

/**
 * Lazy initialization of GoogleGenAI client with required 'aistudio-build' telemetry user-agent
 */
export function getGoogleGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface PromptOptimizeInput {
  prompt: string;
  targetModel?: 'gemini' | 'claude' | 'gpt' | 'generic';
  style?: 'structured' | 'concise' | 'detailed' | 'code-focused';
  detailLevel?: 'standard' | 'expert' | 'strict';
  userId?: string | null;
  userPlan?: string;
  apiKeyId?: string | null;
  ipAddress?: string | null;
}

export interface PromptOptimizeResult {
  result: string;
  model: string;
  originalPrompt: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimated: boolean;
  };
  metadata: {
    style: string;
    targetModel: string;
    executionTimeMs: number;
    provider: 'google-genai';
  };
}

/**
 * Executes high-precision prompt optimization with Gemini 3.7 Flash,
 * usage quota checks, and comprehensive error resilience.
 *
 * NOTE: If GEMINI_API_KEY is not configured, this endpoint returns a 503
 * AI_PROVIDER_NOT_CONFIGURED error. It NEVER returns synthetic AI outputs
 * or logs fake token usage.
 */
export async function optimizePrompt(params: PromptOptimizeInput): Promise<PromptOptimizeResult> {
  const startTime = Date.now();
  const rawPrompt = (params.prompt || '').trim();

  if (!rawPrompt) {
    throw new AppError('Prompt text is required for optimization.', 400, 'INVALID_INPUT');
  }

  const userPlan = params.userPlan || 'FREE';
  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.FREE;

  // 1. Enforce input character length based on plan
  if (rawPrompt.length > limits.maxAiInputChars) {
    throw new AppError(
      `Prompt exceeds maximum allowable length of ${limits.maxAiInputChars} characters for ${limits.name}. (Input length: ${rawPrompt.length})`,
      413,
      'PAYLOAD_TOO_LARGE'
    );
  }

  // 2. Check if Gemini provider is configured BEFORE enforcing usage quota
  const ai = getGoogleGenAI();
  if (!ai || !process.env.GEMINI_API_KEY) {
    throw new AppError(
      'AI provider is not configured. Please configure Gemini API access.',
      503,
      'AI_PROVIDER_NOT_CONFIGURED'
    );
  }

  // 3. Enforce monthly AI quota only when provider is verified available
  if (params.userId) {
    await checkAndEnforceUsageLimit(params.userId, userPlan, 'AI');
  }

  const targetModel = params.targetModel || 'gemini';
  const style = params.style || 'structured';
  const detailLevel = params.detailLevel || 'expert';

  // Build high-precision system instructions
  const systemInstruction = `You are a Staff Prompt Systems Architect and LLM Compiler.
Your mission is to transform loose, casual instructions into ultra-structured, high-accuracy, hallucination-resistant prompt blueprints.
Include clear sections:
1. System Persona & Operational Objective
2. Explicit Functional Requirements
3. Non-Negotiable Constraints (Safety, Zero Hallucination, Edge Cases)
4. Expected Input/Output Schema with Few-Shot Pattern
5. Execution Protocol

Tailor the style: ${style} (detail: ${detailLevel}) for target model family: ${targetModel}.
Return ONLY the formatted Markdown prompt. Do not add conversational preamble.`;

  try {
    // Wrap generateContent in strict timeout promise
    const generatePromise = ai.models.generateContent({
      model: AI_CONFIG.DEFAULT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Raw Task / Instruction to Optimize:\n"""\n${rawPrompt}\n"""\n\nStyle: ${style}\nTarget: ${targetModel}\nLevel: ${detailLevel}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: AI_CONFIG.TEMPERATURE,
        maxOutputTokens: limits.maxAiOutputTokens || AI_CONFIG.MAX_OUTPUT_TOKENS,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT_EXCEEDED')), AI_CONFIG.TIMEOUT_MS)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const executionTimeMs = Date.now() - startTime;

    const resultText = response.text?.trim();
    if (!resultText) {
      throw new AppError('AI provider returned an empty response.', 502, 'AI_REQUEST_FAILED');
    }

    // Distinguish actual token metadata from fallback estimates
    let inputTokens: number;
    let outputTokens: number;
    let isEstimated = false;

    if (response.usageMetadata && typeof response.usageMetadata.promptTokenCount === 'number') {
      inputTokens = response.usageMetadata.promptTokenCount;
      outputTokens = response.usageMetadata.candidatesTokenCount ?? Math.ceil(resultText.length / 4);
    } else {
      inputTokens = Math.ceil(rawPrompt.length / 4);
      outputTokens = Math.ceil(resultText.length / 4);
      isEstimated = true;
    }

    // Record usage in PostgreSQL ONLY after successful real provider completion
    await recordUsageRecord({
      userId: params.userId,
      apiKeyId: params.apiKeyId,
      type: 'AI_PROMPT_OPTIMIZE',
      tokensUsed: inputTokens + outputTokens,
      inputTokens,
      outputTokens,
      executionTimeMs,
      ipAddress: params.ipAddress,
    });

    return {
      result: resultText,
      model: AI_CONFIG.DEFAULT_MODEL,
      originalPrompt: rawPrompt,
      usage: {
        inputTokens,
        outputTokens,
        estimated: isEstimated,
      },
      metadata: {
        style,
        targetModel,
        executionTimeMs,
        provider: 'google-genai',
      },
    };
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }

    if (err.message === 'AI_TIMEOUT_EXCEEDED') {
      throw new AppError(
        'AI provider request timed out after 20 seconds. Please try again with a shorter prompt.',
        504,
        'AI_PROVIDER_TIMEOUT'
      );
    }

    const msg = String(err.message || '');

    // Classify provider errors with stable application error codes
    if (
      msg.includes('API_KEY_INVALID') ||
      msg.includes('API key not valid') ||
      msg.includes('UNAUTHENTICATED') ||
      msg.includes('unauthorized')
    ) {
      console.error('[AIService] Gemini API key authentication failed:', err.message);
      throw new AppError(
        'AI provider authentication failed. Please verify provider credentials.',
        500,
        'AI_PROVIDER_AUTH_FAILED'
      );
    }

    if (
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('429') ||
      msg.includes('quota') ||
      msg.includes('rate limit')
    ) {
      throw new AppError(
        'AI upstream provider quota or rate limit reached. Please try again shortly.',
        429,
        'AI_PROVIDER_RATE_LIMITED'
      );
    }

    if (
      msg.includes('UNAVAILABLE') ||
      msg.includes('503') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ETIMEDOUT')
    ) {
      throw new AppError(
        'AI provider is temporarily unavailable. Please try again shortly.',
        503,
        'AI_PROVIDER_UNAVAILABLE'
      );
    }

    console.warn('[AIService] Unexpected Gemini API failure:', err.message);
    throw new AppError(
      'AI optimization request failed. Please try again.',
      502,
      'AI_REQUEST_FAILED'
    );
  }
}
