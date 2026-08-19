import { ToolDefinition } from '../types/toolEngine';
import { ToolCategory } from '../types';

import {
  jsonFormatterTool,
  regexTesterTool,
  sqlFormatterTool,
  markdownHtmlTool,
  htmlFormatterTool,
  cssFormatterTool,
  caseConverterTool,
  slugGeneratorTool,
} from './tools/developerTools';

import {
  jwtDecoderTool,
  base64Tool,
  hashGeneratorTool,
  uuidGeneratorTool,
  htmlEntityTool,
} from './tools/securityTools';

import {
  unitConverterTool,
  timestampConverterTool,
  urlParserTool,
  urlEncoderTool,
  wordCounterTool,
  numberBaseTool,
  jsonCsvTool,
} from './tools/dataTools';

import {
  colorPaletteTool,
  metaTagGeneratorTool,
  promptOptimizerTool,
} from './tools/designSeoAiTools';

/**
 * Master List of all registered production tools
 */
export const ALL_TOOLS: ToolDefinition[] = [
  // Developer Tools
  jsonFormatterTool,
  regexTesterTool,
  sqlFormatterTool,
  markdownHtmlTool,
  htmlFormatterTool,
  cssFormatterTool,
  caseConverterTool,
  slugGeneratorTool,

  // Security & Encoders
  jwtDecoderTool,
  base64Tool,
  hashGeneratorTool,
  uuidGeneratorTool,
  htmlEntityTool,

  // Data & Converters
  unitConverterTool,
  timestampConverterTool,
  urlParserTool,
  urlEncoderTool,
  wordCounterTool,
  numberBaseTool,
  jsonCsvTool,

  // Design, SEO & AI
  colorPaletteTool,
  metaTagGeneratorTool,
  promptOptimizerTool,
];

/**
 * Slug-based fast lookup dictionary
 */
export const TOOL_REGISTRY: Record<string, ToolDefinition> = {};
ALL_TOOLS.forEach((tool) => {
  TOOL_REGISTRY[tool.slug] = tool;
});

/**
 * Standard Tool Categories
 */
export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'cat-developer',
    name: 'Developer & Code',
    slug: 'developer',
    description: 'Formatters, parsers, regular expressions, SQL indenter, code transformers, and syntax tools.',
    icon: 'Code',
    color: 'emerald',
    toolCount: ALL_TOOLS.filter((t) => t.category === 'developer').length,
  },
  {
    id: 'cat-data',
    name: 'Data & Converters',
    slug: 'data',
    description: 'JSON, CSV, Unix timestamps, unit conversion matrix, number radix, and analytics counters.',
    icon: 'Database',
    color: 'blue',
    toolCount: ALL_TOOLS.filter((t) => t.category === 'data').length,
  },
  {
    id: 'cat-security',
    name: 'Security & Encoders',
    slug: 'security',
    description: 'W3C Web Crypto hashes, JWT inspector, Base64URL, UUID generators, and HTML entity protection.',
    icon: 'ShieldCheck',
    color: 'amber',
    toolCount: ALL_TOOLS.filter((t) => t.category === 'security').length,
  },
  {
    id: 'cat-seo',
    name: 'SEO & Web Vitals',
    slug: 'seo',
    description: 'OpenGraph meta tags, Twitter card generators, permalink slugs, and web performance helpers.',
    icon: 'Globe',
    color: 'purple',
    toolCount: ALL_TOOLS.filter((t) => t.category === 'seo').length,
  },
  {
    id: 'cat-ai',
    name: 'AI & Automation',
    slug: 'ai',
    description: 'System persona engineering, hallucination-resistant prompt blueprints, and LLM optimization.',
    icon: 'Sparkles',
    color: 'indigo',
    toolCount: ALL_TOOLS.filter((t) => t.category === 'ai').length,
  },
];

/**
 * Registry Query Helper Functions
 */

export function getAllTools(): ToolDefinition[] {
  return [...ALL_TOOLS];
}

export function getApiEnabledTools(): ToolDefinition[] {
  return ALL_TOOLS.filter((t) => t.apiEnabled !== false);
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  if (TOOL_REGISTRY[normalized]) {
    return TOOL_REGISTRY[normalized];
  }
  // Try finding by alias or id
  return ALL_TOOLS.find(
    (t) =>
      t.id === slug ||
      t.slug.toLowerCase() === normalized ||
      (t.aliases && t.aliases.some((a) => a.toLowerCase() === normalized))
  );
}

export function getToolsByCategory(categorySlug: string): ToolDefinition[] {
  if (!categorySlug || categorySlug === 'all') {
    return getAllTools();
  }
  const norm = categorySlug.toLowerCase();
  return ALL_TOOLS.filter((t) => t.category.toLowerCase() === norm);
}

export function getPopularTools(): ToolDefinition[] {
  return ALL_TOOLS.filter((t) => t.isPopular || t.usageCount > 5000).sort(
    (a, b) => b.usageCount - a.usageCount
  );
}

export function getRelatedTools(toolSlug: string, limit: number = 4): ToolDefinition[] {
  const current = getToolBySlug(toolSlug);
  if (!current) return ALL_TOOLS.slice(0, limit);

  return ALL_TOOLS.filter(
    (t) => t.slug !== current.slug && (t.category === current.category || t.tags.some((tag) => current.tags.includes(tag)))
  ).slice(0, limit);
}

export function searchTools(query: string, options?: { category?: string; tag?: string }): ToolDefinition[] {
  const clean = (query || '').trim().toLowerCase();

  let results = ALL_TOOLS;

  if (options?.category && options.category !== 'all') {
    results = results.filter((t) => t.category.toLowerCase() === options.category?.toLowerCase());
  }

  if (options?.tag) {
    results = results.filter((t) => t.tags.includes(options.tag as any));
  }

  if (!clean) {
    return results;
  }

  return results.filter((tool) => {
    const nameMatch = tool.name.toLowerCase().includes(clean);
    const descMatch = tool.description.toLowerCase().includes(clean);
    const slugMatch = tool.slug.toLowerCase().includes(clean);
    const tagMatch = tool.tags.some((tg) => tg.toLowerCase().includes(clean));
    const aliasMatch = tool.aliases ? tool.aliases.some((a) => a.toLowerCase().includes(clean)) : false;

    return nameMatch || descMatch || slugMatch || tagMatch || aliasMatch;
  });
}
