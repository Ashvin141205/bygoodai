import { ToolTag, ToolDifficulty, ToolCategory } from './index';

export type ToolInputType =
  | 'text'
  | 'json'
  | 'code'
  | 'url'
  | 'number'
  | 'file'
  | 'color'
  | 'regex'
  | 'sql'
  | 'markdown'
  | 'jwt'
  | 'base64'
  | 'yaml'
  | 'csv'
  | 'html'
  | 'css'
  | 'xml';

export type ToolOutputType =
  | 'text'
  | 'json'
  | 'code'
  | 'html'
  | 'preview'
  | 'color'
  | 'table';

export type ToolOptionType =
  | 'select'
  | 'checkbox'
  | 'toggle'
  | 'text'
  | 'number'
  | 'radio'
  | 'textarea';

export interface ToolOptionChoice {
  label: string;
  value: any;
  description?: string;
}

export interface ToolOptionDefinition {
  id: string;
  label: string;
  description?: string;
  type: ToolOptionType;
  defaultValue: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
  options?: ToolOptionChoice[];
  placeholder?: string;
}

export interface ToolLimits {
  maxInputLength?: number;
  maxExecutionTimeMs?: number;
  maxOutputLength?: number;
  safeRegexTimeoutMs?: number;
}

export interface ToolExample {
  title: string;
  input: string;
  output: string;
  options?: Record<string, any>;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDocumentation {
  overview: string;
  howToUse: string[];
  features: string[];
  examples?: ToolExample[];
  faq: ToolFaq[];
  limitations?: string;
  privacyNotice?: string;
}

export interface ToolSeo {
  title: string;
  metaDescription: string;
  keywords: string[];
  canonicalPath?: string;
}

export interface ToolExecutionContext {
  userPlan?: string;
  isBrowser?: boolean;
  signal?: AbortSignal;
}

export interface ToolExecutionResult {
  success: boolean;
  output: string;
  executionTimeMs: number;
  metadata?: Record<string, any>;
  warnings?: string[];
  error?: string;
  details?: string;
  byteSize?: {
    input: number;
    output: number;
  };
  customView?: 'markdown' | 'html' | 'color' | 'meta' | 'jwt' | 'regex' | 'table' | 'json' | 'unit';
  customData?: any;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string; // matches ToolCategory.slug
  icon: string;
  tags: ToolTag[];
  aliases?: string[];
  difficulty: ToolDifficulty;
  isPopular?: boolean;
  isNew?: boolean;
  isPro?: boolean;
  usageCount: number;
  rating: number;
  averageExecutionMs: number;
  inputType: ToolInputType;
  outputType: ToolOutputType;
  options: ToolOptionDefinition[];
  sampleInput: string;
  inputPlaceholder: string;
  limits?: ToolLimits;
  execute: (
    input: string,
    options: Record<string, any>,
    context?: ToolExecutionContext
  ) => Promise<ToolExecutionResult> | ToolExecutionResult;
  documentation: ToolDocumentation;
  seo?: ToolSeo;
  defaultExportExtension: string;
  mimeType: string;
  privacyText?: string;
  apiEnabled?: boolean;
}
