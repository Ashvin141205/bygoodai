/**
 * ByGoodAI Client - AI Prompt Optimization Service
 * Sends prompt optimization requests to the secure server-side Gemini endpoint.
 */

export interface OptimizePromptOptions {
  prompt: string;
  targetModel?: 'gemini' | 'claude' | 'gpt' | 'generic';
  style?: 'structured' | 'concise' | 'detailed' | 'code-focused';
  detailLevel?: 'standard' | 'expert' | 'strict';
}

export interface OptimizePromptResponse {
  result: string;
  model: string;
  originalPrompt: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimated?: boolean;
  };
  metadata: {
    style: string;
    targetModel: string;
    executionTimeMs: number;
    provider: 'google-genai';
  };
}

export const aiClientService = {
  /**
   * Request server-side prompt optimization
   */
  async optimizePrompt(options: OptimizePromptOptions): Promise<OptimizePromptResponse> {
    const res = await fetch('/api/ai/prompt-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || (res.status === 429 ? 'AI usage limit or rate limit exceeded.' : 'AI prompt optimization failed.');
      throw new Error(msg);
    }

    const json = await res.json();
    return json.data;
  },
};
