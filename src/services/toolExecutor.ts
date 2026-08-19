import { getToolBySlug } from './toolRegistry';
import { ToolExecutionContext, ToolExecutionResult } from '../types/toolEngine';
import { db } from '../db/client';
import { historyService } from './historyService';

export interface ExecuteToolParams {
  toolSlug: string;
  input: string;
  options?: Record<string, any>;
  context?: ToolExecutionContext;
}

/**
 * Production Tool Execution Engine
 * Supports both object parameter and positional argument signatures
 */
export async function executeTool(
  paramsOrSlug: ExecuteToolParams | string,
  maybeInput?: string,
  maybeOptions?: Record<string, any>
): Promise<ToolExecutionResult> {
  let toolSlug: string;
  let input: string;
  let options: Record<string, any>;
  let context: ToolExecutionContext;

  if (typeof paramsOrSlug === 'string') {
    toolSlug = paramsOrSlug;
    input = maybeInput || '';
    options = maybeOptions || {};
    context = { isBrowser: true };
  } else {
    toolSlug = paramsOrSlug.toolSlug;
    input = paramsOrSlug.input;
    options = paramsOrSlug.options || {};
    context = paramsOrSlug.context || { isBrowser: true };
  }

  const tool = getToolBySlug(toolSlug);

  if (!tool) {
    return {
      success: false,
      output: '',
      executionTimeMs: 0,
      error: `Tool "${toolSlug}" was not found in the ByGoodAI Tool Registry.`,
    };
  }

  // 1. Check Input Length against tool limits
  const maxBytes = tool.limits?.maxInputLength || 1024 * 1024 * 5; // 5MB default
  const inputByteLength = new TextEncoder().encode(input || '').byteLength;

  if (inputByteLength > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      output: '',
      executionTimeMs: 0,
      error: `Payload exceeds maximum allowable size limit of ${maxMb}MB for this tool.`,
    };
  }

  // 2. Populate and merge option defaults
  const resolvedOptions: Record<string, any> = {};
  tool.options.forEach((opt) => {
    resolvedOptions[opt.id] = opt.defaultValue;
  });
  Object.assign(resolvedOptions, options);

  // 3. Measure & Execute
  const startTime = performance.now();
  let result: ToolExecutionResult;

  try {
    const rawResult = await Promise.resolve(tool.execute(input, resolvedOptions, context));
    const endTime = performance.now();
    const duration = Math.max(0.1, Number((endTime - startTime).toFixed(2)));

    const outputBytes = new TextEncoder().encode(rawResult.output || '').byteLength;

    result = {
      ...rawResult,
      executionTimeMs: duration,
      byteSize: {
        input: inputByteLength,
        output: outputBytes,
      },
    };
  } catch (err: any) {
    const endTime = performance.now();
    const duration = Math.max(0.1, Number((endTime - startTime).toFixed(2)));

    result = {
      success: false,
      output: '',
      executionTimeMs: duration,
      error: `Execution Exception: ${err.message || 'Unknown processing error'}`,
      details: err.stack ? err.stack.split('\n').slice(0, 2).join(' ') : undefined,
    };
  }

  // 4. Record execution history & statistics asynchronously
  try {
    db.recordToolExecution(
      tool.id,
      result.success ? 'SUCCESS' : 'FAILURE',
      result.executionTimeMs,
      input.slice(0, 300),
      result.output ? result.output.slice(0, 300) : result.error || '',
      tool.name,
      tool.category,
      resolvedOptions
    );

    // Sync to persistent history service if authenticated
    historyService.recordExecution({
      toolSlug: tool.slug,
      toolName: tool.name,
      category: tool.category,
      status: result.success ? 'SUCCESS' : 'ERROR',
      executionTimeMs: Math.round(result.executionTimeMs),
      inputSnippet: input ? input.slice(0, 150) : undefined,
      outputSnippet: result.output ? result.output.slice(0, 150) : result.error?.slice(0, 150),
    }).catch((hErr) => {
      console.warn('[ToolExecutor] Background history sync caught error:', hErr);
    });
  } catch (dbErr) {
    console.warn('Failed to record execution metrics:', dbErr);
  }

  return result;
}
