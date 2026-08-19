/**
 * ByGoodAI Server - Developer API V1 AI Routes
 * Programmatic Gemini-powered prompt engineering endpoint.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireApiKey } from '../../middleware/apiKeyAuthMiddleware';
import { developerApiLimiter } from '../../middleware/rateLimiter';
import { optimizePrompt } from '../../services/aiService';

export const aiV1Router = Router();

const optimizePromptSchema = z.object({
  prompt: z
    .string()
    .min(3, 'Prompt must be at least 3 characters long'),
  targetModel: z.enum(['gemini', 'claude', 'gpt', 'generic']).default('gemini'),
  style: z.enum(['structured', 'concise', 'detailed', 'code-focused']).default('structured'),
  detailLevel: z.enum(['standard', 'expert', 'strict']).default('expert'),
});

/**
 * POST /api/v1/ai/prompt-optimize
 * Optimize prompts programmatically using authenticated API key
 */
aiV1Router.post('/prompt-optimize', requireApiKey, developerApiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = optimizePromptSchema.parse(req.body);

    const result = await optimizePrompt({
      prompt: validated.prompt,
      targetModel: validated.targetModel,
      style: validated.style,
      detailLevel: validated.detailLevel,
      userId: req.user!.id,
      userPlan: req.user!.plan,
      apiKeyId: req.apiKey!.id,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      data: {
        result: result.result,
        model: result.model,
        originalPrompt: result.originalPrompt,
        usage: result.usage,
        metadata: result.metadata,
      },
    });
  } catch (err) {
    next(err);
  }
});
