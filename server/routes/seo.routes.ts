/**
 * ByGoodAI Server - SEO & Search Indexing Routes
 * Dynamically serves /robots.txt, /sitemap.xml, and SEO metadata endpoints.
 */

import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../lib/prisma';
import { ALL_TOOLS, TOOL_CATEGORIES } from '../../src/services/toolRegistry';
import { generateOgPngBuffer } from '../utils/ogImage';

export const seoRouter = Router();

/**
 * Escapes special XML characters to prevent XML injection
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Derives public base URL safely for server-side sitemap & robots generation.
 * In development, safely falls back to request host or localhost.
 * In production, requires configured APP_URL or FRONTEND_URL to avoid emitting fake domains.
 */
export function getServerBaseUrl(req?: Request): string {
  const isProd = process.env.NODE_ENV === 'production';
  const envUrl = process.env.APP_URL || process.env.FRONTEND_URL || process.env.BACKEND_URL;

  if (envUrl && envUrl.trim() && !envUrl.includes('localhost') && !envUrl.includes('bygoodai.example') && !envUrl.includes('example.com')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Development environment fallback
  if (!isProd) {
    if (req) {
      const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
    return 'http://localhost:3000';
  }

  // Production requirement check
  throw new Error('CONFIG_ERROR: Production APP_URL or FRONTEND_URL environment variable is required.');
}

/**
 * GET /robots.txt
 * Production-ready search crawler directives
 */
seoRouter.get('/robots.txt', (req: Request, res: Response) => {
  let baseUrl: string;
  try {
    baseUrl = getServerBaseUrl(req);
  } catch (e: any) {
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Configuration Error: APP_URL or FRONTEND_URL is not configured for production robots.txt generation.');
    return;
  }

  const robotsTxt = `# ByGoodAI Crawl & Indexing Directives
User-agent: *

# Allow Public Content & Assets
Allow: /
Allow: /tools
Allow: /tools/
Allow: /docs
Allow: /blog
Allow: /blog/
Allow: /pricing
Allow: /about
Allow: /contact
Allow: /faq
Allow: /privacy
Allow: /terms
Allow: /assets/
Allow: /*.js$
Allow: /*.css$
Allow: /*.png$
Allow: /*.svg$
Allow: /*.ico$

# Disallow Private & Authenticated Paths
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /profile
Disallow: /profile/
Disallow: /settings
Disallow: /settings/
Disallow: /billing
Disallow: /billing/
Disallow: /admin
Disallow: /admin/
Disallow: /api/

# XML Sitemap Location
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(robotsTxt.trim());
});

/**
 * GET /sitemap.xml
 * Dynamic search engine sitemap containing all valid canonical URLs
 */
seoRouter.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    let baseUrl: string;
    try {
      baseUrl = getServerBaseUrl(req);
    } catch (e: any) {
      res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Configuration Error: APP_URL or FRONTEND_URL is not configured for production sitemap generation.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    interface SitemapUrlEntry {
      loc: string;
      lastmod: string;
      changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
      priority: string;
    }

    const rawUrls: SitemapUrlEntry[] = [];

    // 1. Core Landing & Informational Pages (Audited real public routes)
    const corePages = [
      { path: '/', priority: '1.0', changefreq: 'daily' as const },
      { path: '/tools', priority: '0.9', changefreq: 'daily' as const },
      { path: '/pricing', priority: '0.8', changefreq: 'weekly' as const },
      { path: '/docs', priority: '0.8', changefreq: 'weekly' as const },
      { path: '/blog', priority: '0.7', changefreq: 'daily' as const },
      { path: '/about', priority: '0.6', changefreq: 'monthly' as const },
      { path: '/faq', priority: '0.6', changefreq: 'monthly' as const },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' as const },
      { path: '/privacy', priority: '0.4', changefreq: 'monthly' as const },
      { path: '/terms', priority: '0.4', changefreq: 'monthly' as const },
    ];

    corePages.forEach((p) => {
      rawUrls.push({
        loc: `${baseUrl}${p.path === '/' ? '/' : p.path}`,
        lastmod: today,
        changefreq: p.changefreq,
        priority: p.priority,
      });
    });

    // 2. Category Hub Pages (Real categories from TOOL_CATEGORIES)
    TOOL_CATEGORIES.forEach((cat) => {
      rawUrls.push({
        loc: `${baseUrl}/tools/${cat.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.85',
      });
    });

    // 3. Registered Tool Pages (Real tools from ALL_TOOLS using canonical category/slug path)
    ALL_TOOLS.forEach((tool) => {
      if ((tool as any).isPrivate || (tool as any).status === 'DRAFT') {
        return;
      }
      rawUrls.push({
        loc: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: tool.isPopular ? '0.9' : '0.75',
      });
    });

    // 4. Published Blog Articles from Database (No fake fallbacks)
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true, publishedAt: true },
      });

      if (posts && posts.length > 0) {
        posts.forEach((post) => {
          const modDate = (post.updatedAt || post.publishedAt || new Date()).toISOString().split('T')[0];
          rawUrls.push({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: modDate,
            changefreq: 'monthly',
            priority: '0.7',
          });
        });
      }
    } catch (dbErr: any) {
      if (process.env.NODE_ENV === 'production') {
        res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Error querying published blog posts for sitemap generation');
        return;
      }
    }

    // 5. Deduplicate URLs by normalized canonical loc
    const seen = new Set<string>();
    const deduplicatedUrls: SitemapUrlEntry[] = [];

    for (const item of rawUrls) {
      const urlObj = new URL(item.loc);
      let normPath = urlObj.pathname.replace(/\/+$/, '') || '/';
      const cleanLoc = `${urlObj.origin}${normPath === '/' ? '/' : normPath}`;

      if (!seen.has(cleanLoc)) {
        seen.add(cleanLoc);
        deduplicatedUrls.push({
          ...item,
          loc: cleanLoc,
        });
      }
    }

    // Build XML Output
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${deduplicatedUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
    <changefreq>${escapeXml(u.changefreq)}</changefreq>
    <priority>${escapeXml(u.priority)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (err: any) {
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Error generating sitemap');
  }
});

/**
 * GET /og-image.png (Production 1200x630 PNG Open Graph Image)
 */
seoRouter.get('/og-image.png', (_req: Request, res: Response) => {
  try {
    const staticFilePath = path.join(process.cwd(), 'public', 'og-image.png');
    let buffer: Buffer | null = null;
    if (fs.existsSync(staticFilePath)) {
      const candidate = fs.readFileSync(staticFilePath);
      // Validate full 8-byte PNG signature and 1200x630 IHDR dimensions
      if (
        candidate.length >= 33 &&
        candidate[0] === 0x89 &&
        candidate[1] === 0x50 &&
        candidate[2] === 0x4e &&
        candidate[3] === 0x47 &&
        candidate[4] === 0x0d &&
        candidate[5] === 0x0a &&
        candidate[6] === 0x1a &&
        candidate[7] === 0x0a &&
        candidate.readUInt32BE(16) === 1200 &&
        candidate.readUInt32BE(20) === 630
      ) {
        buffer = candidate;
      }
    }

    if (!buffer) {
      buffer = generateOgPngBuffer(1200, 630);
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(buffer);
  } catch {
    const fallbackBuffer = generateOgPngBuffer(1200, 630);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(fallbackBuffer);
  }
});

/**
 * GET /og-image.svg (Vector Open Graph asset with factual messaging)
 */
seoRouter.get('/og-image.svg', (_req: Request, res: Response) => {
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="150" r="300" fill="#38bdf8" opacity="0.08"/>
  <circle cx="150" cy="500" r="250" fill="#818cf8" opacity="0.08"/>
  
  <g transform="translate(100, 180)">
    <rect x="0" y="0" width="56" height="56" rx="14" fill="url(#accent)"/>
    <path d="M18 28L26 36L38 20" stroke="#0f172a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    
    <text x="76" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="800" fill="#ffffff" letter-spacing="-0.03em">ByGoodAI</text>
    
    <text x="0" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="-0.03em">
      Developer Utilities, Converters &amp; APIs
    </text>
    
    <text x="0" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94a3b8" letter-spacing="-0.01em">
      High-performance in-browser utilities, security encoders &amp; developer tools.
    </text>

    <g transform="translate(0, 240)">
      <rect x="0" y="0" width="220" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="24" y="27" font-family="monospace" font-size="16" fill="#38bdf8" font-weight="600">⚡ In-Browser Execution</text>
      
      <rect x="240" y="0" width="220" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="264" y="27" font-family="monospace" font-size="16" fill="#38bdf8" font-weight="600">🔒 Client-Side Privacy</text>
      
      <rect x="480" y="0" width="230" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="496" y="27" font-family="monospace" font-size="16" fill="#38bdf8" font-weight="600">🛠️ Developer Tools &amp; APIs</text>
    </g>
  </g>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(svg);
});
