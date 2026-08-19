/**
 * ByGoodAI Server - Developer API V1 Tools Routes
 * Programmatic execution endpoint for all ByGoodAI developer tools.
 * Includes options schema validation, input/output payload bounds, timeout guards, and usage metering.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireApiKey } from '../../middleware/apiKeyAuthMiddleware';
import { developerApiLimiter } from '../../middleware/rateLimiter';
import { getApiEnabledTools, getToolBySlug } from '../../../src/services/toolRegistry';
import { recordUsageRecord } from '../../services/usageService';
import { PLAN_LIMITS, DEVELOPER_API_CONFIG } from '../../config/usageLimits';
import { AppError } from '../../middleware/errorHandler';

export const toolsV1Router = Router();

const executeToolSchema = z.object({
  input: z.string().min(1, 'Input string payload is required'),
  options: z.record(z.string(), z.any()).optional().default({}),
});

/**
 * Validates and sanitizes options against a tool's declared options schema
 */
function validateAndResolveOptions(
  toolOptions: Array<{ id: string; type: string; defaultValue: any; options?: Array<{ value: string }> }>,
  providedOptions: Record<string, any>
): { resolved: Record<string, any>; error?: string } {
  const resolved: Record<string, any> = {};

  for (const opt of toolOptions) {
    const userVal = providedOptions[opt.id];

    if (userVal === undefined || userVal === null) {
      resolved[opt.id] = opt.defaultValue;
      continue;
    }

    if (opt.type === 'checkbox') {
      resolved[opt.id] = Boolean(userVal);
    } else if (opt.type === 'select') {
      if (opt.options && opt.options.length > 0) {
        const matching = opt.options.find((o: any) => String(o.value) === String(userVal));
        if (!matching) {
          const allowedValues = opt.options.map((o: any) => o.value);
          return {
            resolved: {},
            error: `Invalid value '${userVal}' for option '${opt.id}'. Allowed values: ${allowedValues.join(', ')}`,
          };
        }
        resolved[opt.id] = matching.value;
      } else {
        resolved[opt.id] = userVal;
      }
    } else if (opt.type === 'number' || opt.type === 'range') {
      const numVal = Number(userVal);
      if (isNaN(numVal)) {
        return {
          resolved: {},
          error: `Option '${opt.id}' must be a valid number.`,
        };
      }
      resolved[opt.id] = numVal;
    } else {
      // Default text or other input: bound string length
      const strVal = String(userVal);
      if (strVal.length > 10000) {
        return {
          resolved: {},
          error: `Option '${opt.id}' value exceeds maximum allowable size.`,
        };
      }
      resolved[opt.id] = strVal;
    }
  }

  return { resolved };
}

/**
 * GET /api/v1/tools
 * List all tools accessible via the developer API
 */
toolsV1Router.get('/', (req: Request, res: Response) => {
  const tools = getApiEnabledTools().map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    category: t.category,
    inputType: t.inputType,
    outputType: t.outputType,
    difficulty: t.difficulty,
    limits: t.limits,
    options: t.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      type: opt.type,
      defaultValue: opt.defaultValue,
      options: opt.options,
    })),
    sampleInput: t.sampleInput,
    endpoint: `/api/v1/tools/${t.slug}`,
  }));

  return res.json({
    success: true,
    data: {
      count: tools.length,
      tools,
    },
  });
});

/**
 * GET /api/v1/tools/:slug
 * Retrieve metadata and options schema for a specific tool
 */
toolsV1Router.get('/:slug', (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.apiEnabled === false) {
    return next(new AppError(`Tool '${slug}' not found in API registry.`, 404, 'TOOL_NOT_FOUND'));
  }

  return res.json({
    success: true,
    data: {
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      inputType: tool.inputType,
      outputType: tool.outputType,
      options: tool.options,
      limits: tool.limits,
      sampleInput: tool.sampleInput,
      endpoint: `/api/v1/tools/${tool.slug}`,
    },
  });
});

/**
 * POST /api/v1/tools/:slug
 * Execute a developer tool programmatically with an API key
 */
toolsV1Router.post('/:slug', requireApiKey, developerApiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { slug } = req.params;

  try {
    const tool = getToolBySlug(slug);
    if (!tool || tool.apiEnabled === false) {
      return next(new AppError(`Tool '${slug}' not found in API registry.`, 404, 'TOOL_NOT_FOUND'));
    }

    const validated = executeToolSchema.parse(req.body);
    const userPlan = req.user?.plan || 'FREE';
    const planLimits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.FREE;

    // 1. Check input payload size
    const byteLength = Buffer.byteLength(validated.input, 'utf8');
    const maxAllowed = Math.min(planLimits.maxInputPayloadBytes, tool.limits?.maxInputLength || planLimits.maxInputPayloadBytes);

    if (byteLength > maxAllowed) {
      return next(
        new AppError(
          `Payload size (${(byteLength / 1024).toFixed(1)} KB) exceeds maximum limit of ${(maxAllowed / 1024).toFixed(1)} KB for this tool on ${planLimits.name}.`,
          413,
          'PAYLOAD_TOO_LARGE'
        )
      );
    }

    // 2. Validate options against schema
    const { resolved: resolvedOptions, error: optionsError } = validateAndResolveOptions(
      tool.options,
      validated.options
    );

    if (optionsError) {
      return next(new AppError(optionsError, 400, 'INVALID_TOOL_OPTIONS'));
    }

    // 3. Execute tool with server-side context and strict timeout
    const executionPromise = Promise.resolve(
      tool.execute(validated.input, resolvedOptions, { isBrowser: false })
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TOOL_EXECUTION_TIMEOUT')), DEVELOPER_API_CONFIG.MAX_TOOL_TIMEOUT_MS)
    );

    const result = await Promise.race([executionPromise, timeoutPromise]);
    const executionTimeMs = Date.now() - startTime;

    // 4. Check output size limit
    const outputByteLength = Buffer.byteLength(result.output || '', 'utf8');
    const maxOutputAllowed = planLimits.maxInputPayloadBytes; // Symmetric upper bound

    if (outputByteLength > maxOutputAllowed) {
      return next(
        new AppError(
          `Tool output size (${(outputByteLength / (1024 * 1024)).toFixed(2)} MB) exceeded plan maximum limit of ${(maxOutputAllowed / (1024 * 1024)).toFixed(2)} MB.`,
          413,
          'OUTPUT_TOO_LARGE'
        )
      );
    }

    // 5. Record usage in PostgreSQL
    await recordUsageRecord({
      userId: req.user!.id,
      apiKeyId: req.apiKey!.id,
      type: 'API_TOOL_EXECUTION',
      toolSlug: tool.slug,
      executionTimeMs,
      ipAddress: req.ip,
    });

    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'TOOL_EXECUTION_FAILED',
          message: result.error || 'The tool failed to process the provided input.',
          details: result.details || null,
        },
        executionTimeMs,
      });
    }

    return res.json({
      success: true,
      data: {
        tool: {
          slug: tool.slug,
          name: tool.name,
          category: tool.category,
        },
        output: result.output,
        customView: result.customView,
        customData: result.customData,
        metadata: result.metadata,
        byteSize: {
          input: byteLength,
          output: outputByteLength,
        },
      },
      executionTimeMs,
    });
  } catch (err: any) {
    if (err.message === 'TOOL_EXECUTION_TIMEOUT') {
      return next(new AppError('Tool execution exceeded server timeout of 10 seconds.', 504, 'TOOL_TIMEOUT'));
    }
    next(err);
  }
});
