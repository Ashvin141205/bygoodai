import { ToolCategory, ToolItem, BlogPost, User } from '../types';
import { ALL_TOOLS, TOOL_CATEGORIES } from '../services/toolRegistry';

export const SEED_CATEGORIES: ToolCategory[] = TOOL_CATEGORIES.map((c) => ({
  ...c,
  color:
    c.slug === 'developer'
      ? 'emerald'
      : c.slug === 'data'
      ? 'blue'
      : c.slug === 'security'
      ? 'amber'
      : c.slug === 'seo'
      ? 'purple'
      : 'indigo',
  badge:
    c.slug === 'developer'
      ? 'Essential'
      : c.slug === 'data'
      ? 'Data Suite'
      : c.slug === 'security'
      ? 'Secure'
      : c.slug === 'seo'
      ? 'Growth'
      : 'AI Powered',
}));

export const SEED_TOOLS: ToolItem[] = ALL_TOOLS.map((t) => ({
  id: t.id,
  slug: t.slug,
  name: t.name,
  description: t.description,
  category: t.category,
  icon: t.icon,
  tags: t.tags,
  isPopular: t.isPopular,
  isNew: t.isNew,
  isPro: t.isPro,
  usageCount: t.usageCount,
  rating: t.rating,
  averageExecutionMs: t.averageExecutionMs,
  sampleInput: t.sampleInput,
  inputPlaceholder: t.inputPlaceholder,
  defaultOptions: t.options.reduce((acc, opt) => {
    acc[opt.id] = opt.defaultValue;
    return acc;
  }, {} as Record<string, any>),
  documentation: {
    overview: t.documentation.overview,
    howToUse: t.documentation.howToUse,
    features: t.documentation.features,
    faq: t.documentation.faq,
  },
}));

export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'client-side-developer-tooling',
    title: 'Architecting Client-Side Developer Tooling',
    summary: 'How modern WebAssembly and browser APIs enable responsive, local data transformations.',
    content: `When developers inspect JSON payloads, format SQL queries, or compute cryptographic hashes, keeping transformations local offers high responsiveness and minimizes unnecessary network overhead.

Modern web standards—including WebAssembly, Web Crypto, and streaming parsers—allow complex transformations to run directly within browser memory. This development guide outlines the architectural patterns used in ByGoodAI's utility engine.`,
    author: {
      name: 'ByGoodAI Engineering',
      role: 'Engineering Team',
    },
    category: 'Engineering',
    tags: ['ARCHITECTURE', 'PERFORMANCE', 'BROWSER_APIS'],
    publishedAt: '2026-08-10T14:30:00Z',
    readTimeMinutes: 5,
  },
  {
    id: 'post-2',
    slug: 'understanding-jwt-inspection',
    title: 'Understanding JSON Web Token Inspection and Cryptographic Signatures',
    summary: 'A technical breakdown of JWT structure, claims validation, and signature verification.',
    content: `A common developer pitfall is assuming that decoding a JWT validates its authenticity. In this guide, we break down header algorithm validation, standard payload claims (exp, nbf, sub), and why signature verification requires private asymmetric keys on a secured server.

ByGoodAI's JWT Inspector parses and analyzes token parts locally while displaying important security considerations for developers.`,
    author: {
      name: 'ByGoodAI Security',
      role: 'Security Team',
    },
    category: 'Security',
    tags: ['SECURITY', 'JWT', 'AUTHENTICATION'],
    publishedAt: '2026-08-04T09:15:00Z',
    readTimeMinutes: 6,
  },
];

export const DEMO_USER: User = {
  id: 'usr_dev_bygood_01',
  name: 'Test Developer',
  email: 'developer@bygoodai.example',
  role: 'USER',
  plan: 'FREE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-08-14T00:00:00.000Z',
  preferences: {
    theme: 'system',
    emailNotifications: true,
    autoSaveHistory: true,
    defaultToolCategory: 'developer',
    compactView: false,
  },
};
