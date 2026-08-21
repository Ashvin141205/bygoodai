/**
 * ByGoodAI Platform - Comprehensive SEO & Metadata Engine
 * Dynamic metadata is applied client-side.
 * 
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

export const DEFAULT_SEO_TITLE = 'ByGoodAI — AI Tools, Developer Tools & APIs';
export const DEFAULT_SEO_DESCRIPTION = 'ByGoodAI provides fast, client-side developer utilities, data converters, security encoders, AI prompt optimizers, and developer APIs.';

/**
 * Resolves absolute canonical URL using configured APP_URL or browser origin.
 * Never emits fake fallback domains in production.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  const envUrl =
    (typeof process !== 'undefined' && (process.env?.APP_URL || process.env?.FRONTEND_URL || process.env?.BACKEND_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_URL);

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() && !envUrl.includes('localhost') && !envUrl.includes('bygoodai.example')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return '';
}

/**
 * Builds normalized, canonical URL (strips query parameters, hash fragments, trailing slash for sub-paths)
 */
export function getCanonicalUrl(path: string = '/'): string {
  const base = getBaseUrl();
  const cleanPath = (path || '/').split('?')[0].split('#')[0];
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // Root path case
  if (normalizedPath === '/' || normalizedPath === '') {
    return base ? `${base}/` : '/';
  }

  // Sub-path: remove trailing slash for strict canonical consistency
  const trimmed = normalizedPath.replace(/\/+$/, '');
  return base ? `${base}${trimmed}` : trimmed;
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
    url: base ? `${base}/` : '/',
    logo: base ? `${base}/og-image.png` : '/og-image.png',
    description: 'High-performance client-first developer utilities, data converters, security encoders, and AI prompt engineering tools.',
  };
}

export function createWebSiteSchema(): Record<string, any> {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ByGoodAI',
    url: base ? `${base}/` : '/',
    description: DEFAULT_SEO_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: 'ByGoodAI',
      url: base ? `${base}/` : '/',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: base ? `${base}/tools?q={search_term_string}` : '/tools?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function createToolSchema(tool: ToolDefinition | ToolItem): Record<string, any> {
  const base = getBaseUrl();
  const toolUrl = base ? `${base}/tools/${tool.category}/${tool.slug}` : `/tools/${tool.category}/${tool.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — ByGoodAI`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any (Modern Web Browser)',
    browserRequirements: 'Requires JavaScript and HTML5 support.',
    description: tool.description,
    url: toolUrl,
    featureList: (tool as any).tags ? (tool as any).tags.join(', ') : 'Online Developer Utility',
    publisher: {
      '@type': 'Organization',
      name: 'ByGoodAI',
      url: base ? `${base}/` : '/',
    },
  };
}

export function createArticleSchema(post: BlogPost): Record<string, any> {
  const base = getBaseUrl();
  const articleUrl = base ? `${base}/blog/${post.slug}` : `/blog/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    url: articleUrl,
    image: (post as any).coverImage || (base ? `${base}/og-image.png` : '/og-image.png'),
    datePublished: post.publishedAt,
    dateModified: (post as any).updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'ByGoodAI Engineering Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ByGoodAI',
      url: base ? `${base}/` : '/',
      logo: {
        '@type': 'ImageObject',
        url: base ? `${base}/og-image.png` : '/og-image.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };
}

export function createBreadcrumbsSchema(breadcrumbs: BreadcrumbItem[]): Record<string, any> {
  const base = getBaseUrl();

  const itemListElement = breadcrumbs.map((crumb, index) => {
    let itemUrl = crumb.url;
    if (!itemUrl.startsWith('http')) {
      itemUrl = base ? `${base}${itemUrl.startsWith('/') ? itemUrl : `/${itemUrl}`}` : (itemUrl.startsWith('/') ? itemUrl : `/${itemUrl}`);
    }
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: itemUrl,
    };
  });

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
 * Updates DOM head elements imperatively on client side.
 * Dynamic metadata is applied client-side.
 * Ensures single source of truth and prevents duplicate tags.
 */
export function updateDOMHead(meta: SEOMetadata): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  // 1. Update Document Title
  const rawTitle = meta.title || DEFAULT_SEO_TITLE;
  const brandTitle = rawTitle.includes('ByGoodAI') ? rawTitle : `${rawTitle} | ByGoodAI`;
  document.title = brandTitle;

  const setUniqueMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string | undefined) => {
    // Remove all existing tags with this selector to prevent duplicate accumulation
    const existing = document.querySelectorAll(`meta[${attrName}="${attrValue}"]`);
    if (!content) {
      existing.forEach((el) => el.remove());
      return;
    }

    if (existing.length > 0) {
      existing[0].setAttribute('content', content);
      for (let i = 1; i < existing.length; i++) {
        existing[i].remove();
      }
    } else {
      const el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      el.setAttribute('content', content);
      document.head.appendChild(el);
    }
  };

  const setUniqueLinkTag = (rel: string, href: string | undefined) => {
    const existing = document.querySelectorAll(`link[rel="${rel}"]`);
    if (!href) {
      existing.forEach((el) => el.remove());
      return;
    }

    if (existing.length > 0) {
      existing[0].setAttribute('href', href);
      for (let i = 1; i < existing.length; i++) {
        existing[i].remove();
      }
    } else {
      const el = document.createElement('link');
      el.setAttribute('rel', rel);
      el.setAttribute('href', href);
      document.head.appendChild(el);
    }
  };

  // 2. Canonical URL (Deduplicated)
  const canonicalUrl = meta.canonicalPath
    ? getCanonicalUrl(meta.canonicalPath)
    : getCanonicalUrl(typeof window !== 'undefined' ? window.location.pathname : '/');
  setUniqueLinkTag('canonical', canonicalUrl);

  // 3. Robots meta (Deduplicated)
  const robotsValue = meta.isPrivate ? 'noindex,nofollow' : meta.robots || 'index,follow';
  setUniqueMetaTag('name', 'robots', robotsValue);

  // 4. Primary Description (Deduplicated)
  const description = meta.description || DEFAULT_SEO_DESCRIPTION;
  setUniqueMetaTag('name', 'description', description);

  // 5. Open Graph tags
  const ogTitle = meta.ogTitle || brandTitle;
  const ogDesc = meta.ogDescription || description;
  const ogUrl = meta.ogUrl || canonicalUrl;
  const base = getBaseUrl();
  const ogImage = meta.ogImage || (base ? `${base}/og-image.png` : '/og-image.png');

  setUniqueMetaTag('property', 'og:site_name', 'ByGoodAI');
  setUniqueMetaTag('property', 'og:type', meta.ogType || 'website');
  setUniqueMetaTag('property', 'og:title', ogTitle);
  setUniqueMetaTag('property', 'og:description', ogDesc);
  setUniqueMetaTag('property', 'og:url', ogUrl);
  if (ogImage) {
    setUniqueMetaTag('property', 'og:image', ogImage);
  }

  // 6. Twitter Card tags
  const twTitle = meta.twitterTitle || ogTitle;
  const twDesc = meta.twitterDescription || ogDesc;
  const twImage = meta.twitterImage || ogImage;

  setUniqueMetaTag('name', 'twitter:card', meta.twitterCard || 'summary_large_image');
  setUniqueMetaTag('name', 'twitter:title', twTitle);
  setUniqueMetaTag('name', 'twitter:description', twDesc);
  if (twImage) {
    setUniqueMetaTag('name', 'twitter:image', twImage);
  }

  // 7. Structured Data (JSON-LD)
  // Remove previously injected jsonld to prevent duplicate script tags
  const existingScripts = document.querySelectorAll('script[data-bygoodai-seo="true"]');
  existingScripts.forEach((s) => s.remove());

  const schemas: Array<Record<string, any>> = [];

  if (meta.jsonLd) {
    if (Array.isArray(meta.jsonLd)) {
      schemas.push(...meta.jsonLd.filter((s) => s && typeof s === 'object' && Object.keys(s).length > 0));
    } else if (typeof meta.jsonLd === 'object' && Object.keys(meta.jsonLd).length > 0) {
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
    });
  }

  return () => {
    // Teardown / cleanup on view unmount
    const cleanupScripts = document.querySelectorAll('script[data-bygoodai-seo="true"]');
    cleanupScripts.forEach((s) => s.remove());
  };
}

/**
 * Alias for updateDOMHead
 */
export const updateDocumentHead = updateDOMHead;

/**
 * Generates normalized SEO metadata object with fallbacks
 */
export function generateSeoMetadata(params: Partial<SEOMetadata> & { title?: string; description?: string }): SEOMetadata {
  const rawTitle = params.title || DEFAULT_SEO_TITLE;
  const title = rawTitle.includes('ByGoodAI') ? rawTitle : `${rawTitle} | ByGoodAI`;
  const description = params.description || DEFAULT_SEO_DESCRIPTION;
  const canonicalPath = params.canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const base = getBaseUrl();
  const defaultOgImage = base ? `${base}/og-image.png` : '/og-image.png';

  return {
    title,
    description,
    canonicalPath,
    robots: params.robots || 'index,follow',
    isPrivate: params.isPrivate,
    ogType: params.ogType || 'website',
    ogTitle: params.ogTitle || title,
    ogDescription: params.ogDescription || description,
    ogImage: params.ogImage || defaultOgImage,
    ogUrl: params.ogUrl || canonicalUrl,
    twitterCard: params.twitterCard || 'summary_large_image',
    twitterTitle: params.twitterTitle || params.ogTitle || title,
    twitterDescription: params.twitterDescription || params.ogDescription || description,
    twitterImage: params.twitterImage || params.ogImage || defaultOgImage,
    jsonLd: params.jsonLd,
    breadcrumbs: params.breadcrumbs,
    publishedTime: params.publishedTime,
    modifiedTime: params.modifiedTime,
    authorName: params.authorName,
    tags: params.tags,
  };
}
