/**
 * ByGoodAI Tool Execution & Registry Service
 * Central proxy routing tool calls to the production ToolEngine and ToolRegistry
 */

import { executeTool as runTool } from './toolExecutor';
import { getToolBySlug, getAllTools, searchTools, getToolsByCategory, getPopularTools, getRelatedTools, TOOL_CATEGORIES, TOOL_REGISTRY } from './toolRegistry';
import { ToolExecutionResult, ToolDefinition } from '../types/toolEngine';

export {
  runTool as executeTool,
  getToolBySlug,
  getAllTools,
  searchTools,
  getToolsByCategory,
  getPopularTools,
  getRelatedTools,
  TOOL_CATEGORIES,
  TOOL_REGISTRY,
};

export type { ToolExecutionResult, ToolDefinition };
