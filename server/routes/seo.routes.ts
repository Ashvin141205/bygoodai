/**
 * ByGoodAI Server - SEO & Search Indexing Routes
 * Dynamically serves /robots.txt, /sitemap.xml, and SEO metadata endpoints.
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ALL_TOOLS, TOOL_CATEGORIES } from '../../src/services/toolRegistry';

export const seoRouter = Router();

/**
 * Derives public base URL safely for server-side sitemap & robots generation
 */
export function getServerBaseUrl(req?: Request): string {
  const envUrl = process.env.APP_URL || process.env.FRONTEND_URL || process.env.BACKEND_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('localhost')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (req) {
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host;
    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  return 'https://bygoodai.example';
}

/**
 * GET /robots.txt
 * Production-ready search crawler directives
 */
seoRouter.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = getServerBaseUrl(req);

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
    const baseUrl = getServerBaseUrl(req);
    const today = new Date().toISOString().split('T')[0];

    interface SitemapUrlEntry {
      loc: string;
      lastmod: string;
      changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
      priority: string;
    }

    const urls: SitemapUrlEntry[] = [];

    // 1. Core Landing & Informational Pages
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
      urls.push({
        loc: `${baseUrl}${p.path === '/' ? '/' : p.path}`,
        lastmod: today,
        changefreq: p.changefreq,
        priority: p.priority,
      });
    });

    // 2. Category Hub Pages
    TOOL_CATEGORIES.forEach((cat) => {
      urls.push({
        loc: `${baseUrl}/tools/${cat.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.85',
      });
    });

    // 3. Registered Tool Pages
    ALL_TOOLS.forEach((tool) => {
      urls.push({
        loc: `${baseUrl}/tools/${tool.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: tool.isPopular ? '0.9' : '0.75',
      });
    });

    // 4. Published Blog Articles from Database
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true, publishedAt: true },
      });

      if (posts && posts.length > 0) {
        posts.forEach((post) => {
          const modDate = (post.updatedAt || post.publishedAt || new Date()).toISOString().split('T')[0];
          urls.push({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: modDate,
            changefreq: 'monthly',
            priority: '0.7',
          });
        });
      } else {
        // Static seed fallback
        const staticBlogSlugs = ['client-side-developer-tooling', 'understanding-jwt-inspection'];
        staticBlogSlugs.forEach((slug) => {
          urls.push({
            loc: `${baseUrl}/blog/${slug}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.7',
          });
        });
      }
    } catch {
      // Offline fallback
      const staticBlogSlugs = ['client-side-developer-tooling', 'understanding-jwt-inspection'];
      staticBlogSlugs.forEach((slug) => {
        urls.push({
          loc: `${baseUrl}/blog/${slug}`,
          lastmod: today,
          changefreq: 'monthly',
          priority: '0.7',
        });
      });
    }

    // Build XML Output
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (err: any) {
    res.status(500).setHeader('Content-Type', 'text/plain').send('Error generating sitemap');
  }
});

/**
 * GET /og-image.png (Dynamic / Vector Open Graph banner asset)
 */
seoRouter.get('/og-image.png', (_req: Request, res: Response) => {
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
      AI Tools, Developer Tools &amp; APIs
    </text>
    
    <text x="0" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94a3b8" letter-spacing="-0.01em">
      High-performance client-first developer utilities, security encoders &amp; AI prompt optimizers.
    </text>

    <g transform="translate(0, 240)">
      <rect x="0" y="0" width="220" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="24" y="27" font-family="monospace" font-size="16" fill="#38bdf8" font-weight="600">⚡ 0ms Client Latency</text>
      
      <rect x="240" y="0" width="220" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="264" y="27" font-family="monospace" font-size="16" fill="#38bdf8" font-weight="600">🔒 Zero Telemetry Leaks</text>
      
      <rect x="480" y="0" width="220" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="504" y="27" font-family="monospace" font-size="16" fill="#38bdf8" font-weight="600">🛠️ 20+ Production Tools</text>
    </g>
  </g>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(svg);
});
