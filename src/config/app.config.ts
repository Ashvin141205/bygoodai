/**
 * Centralized Application Configuration
 * Holds global constants, navigation hierarchy, feature flags, and metadata
 */

export const APP_CONFIG = {
  name: 'ByGoodAI Platform',
  shortName: 'ByGoodAI',
  tagline: 'Production-Grade Developer Utilities & Workflow Acceleration Suite',
  description: 'An open, high-performance platform featuring developer tools, data converters, security encoders, AI prompt optimizers, and cloud analytics.',
  version: '2.4.0',
  author: 'ByGoodAI Core Engineering Team',
  url: typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_APP_URL || 'https://bygoodai.example'),
  contactEmail: 'support@bygoodai.example',

  // Feature Flags
  features: {
    enableAiFeatures: true,
    enableHistoryPersistence: true,
    enableCommandPalette: true,
    enableTelemetry: true,
    enableBlog: true,
    enableAdminDashboard: true,
    enableDarkMode: true,
  },

  // Limits & Quotas
  limits: {
    freeExecutionsPerDay: 500,
    proExecutionsPerDay: 50000,
    maxInputLengthBytes: 1024 * 1024 * 5, // 5MB
    historyRetentionDays: 30,
  },

  // Navigation Links
  navigation: [
    { label: 'Explore Tools', href: '/tools' },
    { label: 'Categories', href: '/categories' },
    { label: 'Workstation', href: '/dashboard' },
    { label: 'API & Docs', href: '/docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Pricing', href: '/pricing' },
  ],

  // Footer Link Groups
  footerLinks: {
    platform: [
      { label: 'All Tools Directory', href: '/tools' },
      { label: 'System Dashboard', href: '/dashboard' },
      { label: 'Performance Metrics', href: '/admin' },
      { label: 'Platform Changelog', href: '/blog' },
    ],
    categories: [
      { label: 'Developer & Code', href: '/tools/developer' },
      { label: 'Data & Formats', href: '/tools/data' },
      { label: 'Security & Encoders', href: '/tools/security' },
      { label: 'SEO & Web Vitals', href: '/tools/seo' },
      { label: 'AI & Automation', href: '/tools/ai' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'REST API Specs', href: '/docs' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    company: [
      { label: 'About ByGoodAI', href: '/about' },
      { label: 'Contact Engineering', href: '/contact' },
      { label: 'Frequently Asked Questions', href: '/faq' },
    ],
  },

  // Social & Repository
  social: {
    github: 'https://github.com/bygoodai/platform',
    twitter: 'https://twitter.com/bygoodai_dev',
    discord: 'https://discord.gg/bygoodai',
  },

  // Pricing Plans
  pricingTiers: [
    {
      id: 'community',
      name: 'Community Free',
      price: '₹0',
      period: 'Forever free',
      description: 'Essential developer tools with client-side execution and 1,000 monthly API requests.',
      features: [
        'Unlimited local client-side tool executions',
        '2 active Developer API keys (/api/v1)',
        '1,000 automated API requests / month',
        '50 AI prompt optimizations / month',
        '15 requests / minute rate limit',
        '256 KB max input payload size',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Developer Pro',
      price: '₹199',
      period: 'per month',
      description: 'Engineered for power users needing higher API throughput, AI capacity, and expanded keys.',
      features: [
        'Everything in Community Free',
        '10 active Developer API keys',
        '50,000 automated API requests / month',
        '1,000 AI prompt optimizations / month',
        '60 requests / minute rate limit',
        '5 MB max input payload size',
        'Priority tool execution pipeline',
      ],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '₹999',
      period: 'per month',
      description: 'Maximum quota allocations, expanded team API keys, and high-throughput execution limits.',
      features: [
        'Everything in Developer Pro',
        '50 active Developer API keys',
        '500,000 automated API requests / month',
        '10,000 AI prompt optimizations / month',
        '300 requests / minute rate limit',
        '25 MB max input payload size',
        'High-concurrency API allocation',
      ],
      cta: 'Upgrade to Enterprise',
      popular: false,
    },
  ],
};
