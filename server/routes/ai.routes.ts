/**
 * ByGoodAI Server - AI API Routes
 * Secure server-side proxy for Gemini operations with usage tracking and rate limits.
 * GEMINI_API_KEY is never exposed to the client.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiLimiter } from '../middleware/rateLimiter';
import { optionalAuth } from '../middleware/authMiddleware';
import { optimizePrompt } from '../services/aiService';

export const aiRouter = Router();

const optimizePromptSchema = z.object({
  prompt: z
    .string()
    .min(3, 'Prompt must be at least 3 characters long')
    .max(64000, 'Prompt exceeds maximum character limit'),
  targetModel: z.enum(['gemini', 'claude', 'gpt', 'generic']).default('gemini'),
  style: z.enum(['structured', 'concise', 'detailed', 'code-focused']).default('structured'),
  detailLevel: z.enum(['standard', 'expert', 'strict']).default('expert'),
});

/**
 * POST /api/ai/prompt-optimize
 * Transforms user prompts into high-precision, hallucination-resistant structured prompts
 */
aiRouter.post('/prompt-optimize', aiLimiter, optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = optimizePromptSchema.parse(req.body);

    const user = req.user;
    const result = await optimizePrompt({
      prompt: validated.prompt,
      targetModel: validated.targetModel,
      style: validated.style,
      detailLevel: validated.detailLevel,
      userId: user?.id || null,
      userPlan: user?.plan || 'FREE',
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

/**
 * POST /api/ai/optimize-prompt (Backwards compatibility alias)
 */
aiRouter.post('/optimize-prompt', aiLimiter, optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Map legacy targetModel names if provided
    let rawTarget = req.body.targetModel;
    if (rawTarget && typeof rawTarget === 'string') {
      if (rawTarget.includes('gemini')) req.body.targetModel = 'gemini';
      else if (rawTarget.includes('claude')) req.body.targetModel = 'claude';
      else if (rawTarget.includes('gpt')) req.body.targetModel = 'gpt';
    }

    const validated = optimizePromptSchema.parse(req.body);

    const user = req.user;
    const result = await optimizePrompt({
      prompt: validated.prompt,
      targetModel: validated.targetModel,
      style: validated.style,
      detailLevel: validated.detailLevel,
      userId: user?.id || null,
      userPlan: user?.plan || 'FREE',
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
