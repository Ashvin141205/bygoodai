/**
 * ByGoodAI Platform - Comprehensive SEO & Metadata Engine
 * Manages dynamic document metadata, canonical URL normalization,
 * Open Graph / Twitter Cards, XSS-safe JSON-LD schemas, and visible breadcrumbs.
 */

import { APP_CONFIG } from '../config/app.config';
import { ToolDefinition } from '../types/toolEngine';
import { BlogPost, ToolItem } from '../types';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  canonicalPath?: string;
  robots?: 'index,follow' | 'noindex,nofollow' | 'noindex,follow' | 'index,nofollow';
  isPrivate?: boolean;
  ogType?: 'website' | 'article' | 'profile';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  breadcrumbs?: BreadcrumbItem[];
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  tags?: string[];
}

/**
 * Resolves absolute canonical URL using configured APP_URL or browser origin
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  const envUrl =
    (typeof process !== 'undefined' && (process.env?.APP_URL || process.env?.FRONTEND_URL || process.env?.BACKEND_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_URL);

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() && !envUrl.includes('localhost')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return (APP_CONFIG.url || 'https://bygoodai.example').replace(/\/+$/, '');
}

/**
 * Builds normalized, absolute HTTPS canonical URL
 */
export function getCanonicalUrl(path: string = '/'): string {
  const base = getBaseUrl();
  const cleanPath = (path || '/').split('?')[0].split('#')[0];
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // Root case
  if (normalizedPath === '/' || normalizedPath === '') {
    return `${base}/`;
  }

  // Remove trailing slash for sub-paths for strict canonical consistency
  const trimmed = normalizedPath.replace(/\/+$/, '');
  return `${base}${trimmed}`;
}

/**
 * Escapes strings to prevent HTML injection in meta content
 */
export function sanitizeMetaString(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

/**
 * Schema.org Generators (JSON-LD)
 */

export function createOrganizationSchema(): Record<string, any> {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ByGoodAI',
    url: `${base}/`,
    logo: `${base}/og-image.png`,
    description: 'High-performance client-first developer utilities, data converters, security encoders, and AI prompt engineering tools.',
    sameAs: [],
  };
}

export function createWebSiteSchema(): Record<string, any> {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ByGoodAI',
    url: `${base}/`,
    description: 'ByGoodAI — AI Tools, Developer Tools & APIs. High-performance, client-side developer utilities with zero telemetry leaks.',
    publisher: {
      '@type': 'Organization',
      name: 'ByGoodAI',
      url: `${base}/`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/tools?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function createToolSchema(tool: ToolDefinition | ToolItem): Record<string, any> {
  const base = getBaseUrl();
  const toolUrl = `${base}/tools/${tool.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — ByGoodAI`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any (Web Browser)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: tool.description,
    url: toolUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: (tool as any).tags ? (tool as any).tags.join(', ') : 'Online Developer Utility',
    publisher: {
      '@type': 'Organization',
      name: 'ByGoodAI',
      url: `${base}/`,
    },
  };
}

export function createArticleSchema(post: BlogPost): Record<string, any> {
  const base = getBaseUrl();
  const articleUrl = `${base}/blog/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    url: articleUrl,
    image: (post as any).coverImage || `${base}/og-image.png`,
    datePublished: post.publishedAt,
    dateModified: (post as any).updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'ByGoodAI Engineering',
      jobTitle: post.author?.role || 'Engineering Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ByGoodAI',
      url: `${base}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${base}/og-image.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };
}

export function createTechArticleSchema(doc: { title: string; description: string; path: string }): Record<string, any> {
  const base = getBaseUrl();
  const docUrl = `${base}${doc.path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: doc.title,
    description: doc.description,
    url: docUrl,
    author: {
      '@type': 'Organization',
      name: 'ByGoodAI Engineering Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ByGoodAI',
      url: `${base}/`,
    },
  };
}

export function createBreadcrumbsSchema(breadcrumbs: BreadcrumbItem[]): Record<string, any> {
  const base = getBaseUrl();

  const itemListElement = breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url.startsWith('http') ? crumb.url : `${base}${crumb.url.startsWith('/') ? crumb.url : `/${crumb.url}`}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function createFAQSchema(faqs: FAQItem[]): Record<string, any> {
  if (!faqs || faqs.length === 0) return {};

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Updates DOM head elements imperatively on client side
 */
export function updateDOMHead(meta: SEOMetadata): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  // 1. Update Document Title
  const brandTitle = meta.title.includes('ByGoodAI') ? meta.title : `${meta.title} | ByGoodAI`;
  document.title = brandTitle;

  // Track dynamically injected tags for cleanup
  const injectedElements: HTMLElement[] = [];

  const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string | undefined) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
      injectedElements.push(element);
    }
    element.setAttribute('content', content);
  };

  const setLinkTag = (rel: string, href: string | undefined) => {
    if (!href) return;
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
      injectedElements.push(element);
    }
    element.setAttribute('href', href);
  };

  // 2. Canonical URL
  const canonicalUrl = meta.canonicalPath
    ? getCanonicalUrl(meta.canonicalPath)
    : getCanonicalUrl(window.location.pathname);
  setLinkTag('canonical', canonicalUrl);

  // 3. Robots meta
  const robotsValue = meta.isPrivate ? 'noindex,nofollow' : meta.robots || 'index,follow';
  setMetaTag('name', 'robots', robotsValue);

  // 4. Primary Description
  setMetaTag('name', 'description', meta.description);

  // 5. Open Graph tags
  const ogTitle = meta.ogTitle || brandTitle;
  const ogDesc = meta.ogDescription || meta.description;
  const defaultOgImage = `${getBaseUrl()}/og-image.png`;
  const ogImage = meta.ogImage || defaultOgImage;
  const ogUrl = meta.ogUrl || canonicalUrl;

  setMetaTag('property', 'og:site_name', 'ByGoodAI');
  setMetaTag('property', 'og:type', meta.ogType || 'website');
  setMetaTag('property', 'og:title', ogTitle);
  setMetaTag('property', 'og:description', ogDesc);
  setMetaTag('property', 'og:url', ogUrl);
  setMetaTag('property', 'og:image', ogImage);

  // 6. Twitter Card tags
  const twTitle = meta.twitterTitle || ogTitle;
  const twDesc = meta.twitterDescription || ogDesc;
  const twImage = meta.twitterImage || ogImage;

  setMetaTag('name', 'twitter:card', meta.twitterCard || 'summary_large_image');
  setMetaTag('name', 'twitter:title', twTitle);
  setMetaTag('name', 'twitter:description', twDesc);
  setMetaTag('name', 'twitter:image', twImage);

  // 7. Structured Data (JSON-LD)
  // Remove previously injected jsonld
  const existingScripts = document.querySelectorAll('script[data-bygoodai-seo="true"]');
  existingScripts.forEach((s) => s.remove());

  const schemas: Array<Record<string, any>> = [];

  if (meta.jsonLd) {
    if (Array.isArray(meta.jsonLd)) {
      schemas.push(...meta.jsonLd.filter(Boolean));
    } else if (typeof meta.jsonLd === 'object') {
      schemas.push(meta.jsonLd);
    }
  }

  if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
    schemas.push(createBreadcrumbsSchema(meta.breadcrumbs));
  }

  if (schemas.length > 0) {
    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-bygoodai-seo', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      injectedElements.push(script);
    });
  }

  return () => {
    // Teardown / cleanup on view unmount
    existingScripts.forEach((s) => s.remove());
  };
}
