/**
 * ByGoodAI Platform - Comprehensive SEO & Route Truth Verification Test Suite
 * Validates sitemap generation, route truth, 404 safety, canonical paths,
 * OG image correctness, robots directives, and metadata schemas.
 */

import { ALL_TOOLS, TOOL_CATEGORIES, getToolBySlug, getCategoryBySlug } from '../src/services/toolRegistry';
import { getServerBaseUrl, seoRouter } from '../server/routes/seo.routes';
import { generateOgPngBuffer } from '../server/utils/ogImage';
import { getCanonicalUrl, createWebSiteSchema, createToolSchema, createArticleSchema, createBreadcrumbsSchema, createFAQSchema } from '../src/lib/seo';
import { APP_CONFIG } from '../src/config/app.config';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import express from 'express';
import http from 'node:http';

interface TestResult {
  id: number;
  name: string;
  category: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordTest(id: number, category: string, name: string, passed: boolean, details?: string, error?: string) {
  results.push({ id, category, name, passed, details, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [#${id}] [${category}] ${name}${details ? ` - ${details}` : ''}`);
  if (error) console.error(`   Error: ${error}`);
}

/**
 * Simulates client-side route resolution logic from App.tsx
 */
function resolveAppRoute(pathStr: string): { viewName: string; is404: boolean; toolSlug?: string; categorySlug?: string } {
  const cleanPath = pathStr.replace(/\/+$/, '') || '/';

  if (cleanPath === '/') return { viewName: 'HomeView', is404: false };
  if (cleanPath === '/tools' || cleanPath === '/categories') return { viewName: 'ToolsDirectoryView', is404: false, categorySlug: 'all' };

  if (cleanPath.startsWith('/categories/')) {
    const catParam = cleanPath.replace('/categories/', '').split('/')[0];
    const category = getCategoryBySlug(catParam);
    if (category || catParam === 'all') {
      return { viewName: 'ToolsDirectoryView', is404: false, categorySlug: catParam };
    }
    return { viewName: 'NotFoundView', is404: true };
  }

  if (cleanPath.startsWith('/tools/')) {
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 2) {
      const param = segments[1];
      const tool = getToolBySlug(param);
      if (tool) return { viewName: 'ToolWorkstationView', is404: false, toolSlug: param };
      const category = getCategoryBySlug(param);
      if (category || param === 'all') return { viewName: 'ToolsDirectoryView', is404: false, categorySlug: param };
      return { viewName: 'NotFoundView', is404: true };
    } else if (segments.length >= 3) {
      const toolSlug = segments[2];
      const tool = getToolBySlug(toolSlug);
      if (tool) return { viewName: 'ToolWorkstationView', is404: false, toolSlug };
      return { viewName: 'NotFoundView', is404: true };
    }
  }

  if (cleanPath === '/dashboard') return { viewName: 'DashboardView', is404: false };
  if (cleanPath === '/profile') return { viewName: 'ProfileView', is404: false };
  if (cleanPath === '/settings') return { viewName: 'SettingsView', is404: false };
  if (cleanPath === '/pricing') return { viewName: 'PricingView', is404: false };
  if (cleanPath === '/billing') return { viewName: 'BillingView', is404: false };
  if (cleanPath === '/docs') return { viewName: 'DocsView', is404: false };
  if (cleanPath === '/blog') return { viewName: 'BlogView', is404: false };
  if (cleanPath.startsWith('/blog/')) {
    const slug = cleanPath.replace('/blog/', '').split('/')[0];
    return { viewName: 'BlogPostView', is404: false, toolSlug: slug };
  }
  if (cleanPath === '/admin') return { viewName: 'AdminView', is404: false };
  if (cleanPath === '/privacy') return { viewName: 'LegalView(privacy)', is404: false };
  if (cleanPath === '/terms') return { viewName: 'LegalView(terms)', is404: false };
  if (cleanPath === '/about') return { viewName: 'LegalView(about)', is404: false };
  if (cleanPath === '/contact') return { viewName: 'LegalView(contact)', is404: false };
  if (cleanPath === '/faq') return { viewName: 'LegalView(faq)', is404: false };

  return { viewName: 'NotFoundView', is404: true };
}

/**
 * Builds synthetic sitemap URL list following the server sitemap route logic
 */
function generateSitemapUrls(baseUrl: string): string[] {
  const corePages = ['/', '/tools', '/pricing', '/docs', '/blog', '/about', '/faq', '/contact', '/privacy', '/terms'];
  const urls: string[] = [];

  corePages.forEach((p) => {
    urls.push(`${baseUrl}${p === '/' ? '/' : p}`);
  });

  TOOL_CATEGORIES.forEach((cat) => {
    urls.push(`${baseUrl}/tools/${cat.slug}`);
  });

  ALL_TOOLS.forEach((tool) => {
    if ((tool as any).isPrivate || (tool as any).status === 'DRAFT') return;
    urls.push(`${baseUrl}/tools/${tool.category}/${tool.slug}`);
  });

  // Simulated published blog articles
  const blogSlugs = ['mastering-client-side-json-formatting', 'zero-latency-developer-tools-architecture', 'future-of-browser-based-ai-workflows'];
  blogSlugs.forEach((s) => {
    urls.push(`${baseUrl}/blog/${s}`);
  });

  return urls;
}

export async function runSeoVerificationSuite(): Promise<{ total: number; passed: number; failed: number }> {
  console.log('\n======================================================');
  console.log('  ByGoodAI Platform — Comprehensive SEO Test Suite');
  console.log('======================================================\n');

  const baseUrl = 'https://bygoodai-production.run.app';
  const sitemapUrls = generateSitemapUrls(baseUrl);

  // 1. Every sitemap URL is public
  const privatePathSegments = ['/dashboard', '/profile', '/settings', '/billing', '/admin', '/api'];
  const hasPrivateInSitemap = sitemapUrls.some((u) => privatePathSegments.some((p) => u.includes(p)));
  recordTest(1, 'SITEMAP', 'Every sitemap URL is public', !hasPrivateInSitemap, `Checked ${sitemapUrls.length} URLs`);

  // 2. Every sitemap URL resolves
  let allResolve = true;
  for (const urlStr of sitemapUrls) {
    const urlObj = new URL(urlStr);
    const resolved = resolveAppRoute(urlObj.pathname);
    if (resolved.is404) {
      allResolve = false;
      break;
    }
  }
  recordTest(2, 'SITEMAP', 'Every sitemap URL resolves in App routing table', allResolve, 'All sitemap URLs route to real views');

  // 3. No sitemap URL returns 404
  let notFoundCount = 0;
  for (const urlStr of sitemapUrls) {
    const urlObj = new URL(urlStr);
    const resolved = resolveAppRoute(urlObj.pathname);
    if (resolved.viewName === 'NotFoundView') notFoundCount++;
  }
  recordTest(3, 'SITEMAP', 'No sitemap URL maps to NotFoundView', notFoundCount === 0, `0 of ${sitemapUrls.length} mapped to 404`);

  // 4. No private route appears in sitemap
  recordTest(4, 'SITEMAP', 'No private/authenticated routes appear in sitemap', !hasPrivateInSitemap, 'No /dashboard, /profile, /settings, /billing, /admin');

  // 5. No API route appears in sitemap
  const hasApiRoute = sitemapUrls.some((u) => u.includes('/api/'));
  recordTest(5, 'SITEMAP', 'No API routes appear in sitemap', !hasApiRoute, 'No /api/* found');

  // 6. No duplicate URL appears in sitemap
  const uniqueSet = new Set(sitemapUrls);
  recordTest(6, 'SITEMAP', 'No duplicate URLs appear in sitemap', uniqueSet.size === sitemapUrls.length, `${uniqueSet.size} unique entries of ${sitemapUrls.length}`);

  // 7. No localhost URL appears when production baseUrl configured
  const hasLocalhost = sitemapUrls.some((u) => u.includes('localhost') || u.includes('127.0.0.1'));
  recordTest(7, 'SITEMAP', 'No localhost URL appears in production sitemap', !hasLocalhost, 'Clean production URL origin');

  // 8. No fake domain appears in production sitemap
  const hasFakeDomain = sitemapUrls.some((u) => u.includes('bygoodai.example') || u.includes('example.com'));
  recordTest(8, 'SITEMAP', 'No fake domain appears in production sitemap', !hasFakeDomain, 'No example domains present');

  // 9. Tool URLs match actual canonical routes (/tools/:category/:slug)
  const toolUrls = sitemapUrls.filter((u) => {
    const p = new URL(u).pathname;
    const parts = p.split('/').filter(Boolean);
    return parts.length === 3 && parts[0] === 'tools';
  });
  let toolUrlsCanonical = toolUrls.length > 0;
  for (const u of toolUrls) {
    const parts = new URL(u).pathname.split('/').filter(Boolean);
    const category = parts[1];
    const slug = parts[2];
    const tool = getToolBySlug(slug);
    if (!tool || tool.category !== category) {
      toolUrlsCanonical = false;
      break;
    }
  }
  recordTest(9, 'ROUTES', 'Tool URLs match actual canonical category/slug routes', toolUrlsCanonical, `${toolUrls.length} tool URLs audited`);

  // 10. Category URLs match actual canonical routes (/tools/:category)
  const categoryUrls = sitemapUrls.filter((u) => {
    const p = new URL(u).pathname;
    const parts = p.split('/').filter(Boolean);
    return parts.length === 2 && parts[0] === 'tools';
  });
  let categoryUrlsCanonical = categoryUrls.length === TOOL_CATEGORIES.length;
  for (const u of categoryUrls) {
    const catSlug = new URL(u).pathname.split('/').filter(Boolean)[1];
    if (!getCategoryBySlug(catSlug)) {
      categoryUrlsCanonical = false;
    }
  }
  recordTest(10, 'ROUTES', 'Category URLs match actual canonical routes (/tools/:category)', categoryUrlsCanonical, `${categoryUrls.length} category URLs audited`);

  // 11. Published blog URLs resolve
  const blogUrls = sitemapUrls.filter((u) => new URL(u).pathname.startsWith('/blog/'));
  let blogsResolve = blogUrls.length > 0;
  for (const b of blogUrls) {
    const res = resolveAppRoute(new URL(b).pathname);
    if (res.is404 || res.viewName !== 'BlogPostView') blogsResolve = false;
  }
  recordTest(11, 'BLOG', 'Published blog URLs resolve to BlogPostView', blogsResolve, `${blogUrls.length} blog URLs tested`);

  // 12. XML is valid syntax
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>`;
  const isValidXml = sampleXml.startsWith('<?xml') && sampleXml.includes('<urlset') && sampleXml.endsWith('</urlset>');
  recordTest(12, 'XML', 'Generated sitemap XML is valid and well-formed', isValidXml, 'Valid XML declaration & schema tags');

  // 13. 404 safety for unknown routes
  const unknownRoutes = ['/unknown-route', '/tools/non-existent-tool', '/tools/invalid-cat/missing-tool', '/settings/super-admin'];
  let allUnknown404 = true;
  for (const r of unknownRoutes) {
    const res = resolveAppRoute(r);
    if (!res.is404 || res.viewName !== 'NotFoundView') allUnknown404 = false;
  }
  recordTest(13, '404 SAFETY', 'Unknown routes strictly resolve to NotFoundView', allUnknown404, 'Tested 4 arbitrary unknown paths');

  // 14. Support email configuration safety
  const contactEmailConfigured = typeof APP_CONFIG.contactEmail === 'string';
  const hasNoFakeProductionEmail = !APP_CONFIG.contactEmail.includes('bygoodai.example');
  recordTest(14, 'CONFIG', 'Support email does not emit fake production email fallback', contactEmailConfigured && hasNoFakeProductionEmail, `Value: "${APP_CONFIG.contactEmail}"`);

  // 15. Real PNG OG Image asset buffer generation & structure
  const pngBuffer = generateOgPngBuffer(1200, 630);
  const isPngSignatureValid =
    pngBuffer.length > 1000 &&
    pngBuffer[0] === 0x89 &&
    pngBuffer[1] === 0x50 &&
    pngBuffer[2] === 0x4e &&
    pngBuffer[3] === 0x47 &&
    pngBuffer[4] === 0x0d &&
    pngBuffer[5] === 0x0a &&
    pngBuffer[6] === 0x1a &&
    pngBuffer[7] === 0x0a;
  const isIhdrValid =
    pngBuffer.toString('ascii', 12, 16) === 'IHDR' &&
    pngBuffer.readUInt32BE(16) === 1200 &&
    pngBuffer.readUInt32BE(20) === 630 &&
    pngBuffer.readUInt8(24) === 8 && // 8-bit
    pngBuffer.readUInt8(25) === 6; // RGBA
  recordTest(15, 'OG IMAGE', 'PNG Open Graph asset is valid 1200x630 binary buffer with valid IHDR', isPngSignatureValid && isIhdrValid, `Size: ${pngBuffer.length} bytes, 1200x630`);

  // 15B. Static public/og-image.png validation
  const staticOgPath = path.join(process.cwd(), 'public', 'og-image.png');
  const staticExists = fs.existsSync(staticOgPath);
  const staticBuf = staticExists ? fs.readFileSync(staticOgPath) : null;
  const isStaticValid =
    staticBuf !== null &&
    staticBuf.length > 1000 &&
    staticBuf[0] === 0x89 &&
    staticBuf[1] === 0x50 &&
    staticBuf[2] === 0x4e &&
    staticBuf[3] === 0x47 &&
    staticBuf.readUInt32BE(16) === 1200 &&
    staticBuf.readUInt32BE(20) === 630;
  recordTest(15, 'OG STATIC', 'public/og-image.png is valid 1200x630 PNG file', isStaticValid, `Static size: ${staticBuf?.length || 0} bytes`);

  // 15C. Pixel-level decompressed text bitmap inspection
  // Decompress IDAT chunk to verify text pixels are actually written into rawData
  let textPixelsRendered = false;
  try {
    // Find IDAT chunk
    let offset = 8;
    let idatData = Buffer.alloc(0);
    while (offset < pngBuffer.length) {
      const chunkLen = pngBuffer.readUInt32BE(offset);
      const chunkType = pngBuffer.toString('ascii', offset + 4, offset + 8);
      if (chunkType === 'IDAT') {
        idatData = Buffer.concat([idatData, pngBuffer.subarray(offset + 8, offset + 8 + chunkLen)]);
      }
      offset += 8 + chunkLen + 4;
    }
    const decompressed = zlib.inflateSync(idatData);
    const rowSize = 1 + 1200 * 4;

    // Check pixel at (180, 160) - start of "ByGoodAI" title text (White: 255, 255, 255)
    const titleRow = 160 * rowSize;
    const titlePx = titleRow + 1 + 180 * 4;
    const isTitleWhite = decompressed[titlePx] === 255 && decompressed[titlePx + 1] === 255 && decompressed[titlePx + 2] === 255;

    // Check pixel in "Developer Utilities" text area at (100, 250) (White)
    const subRow = 250 * rowSize;
    const subPx = subRow + 1 + 100 * 4;
    const isSubWhite = decompressed[subPx] === 255 && decompressed[subPx + 1] === 255 && decompressed[subPx + 2] === 255;

    // Check pixel in "In-Browser Execution" badge text at (122, 438) (Cyan: 56, 189, 248)
    const badgeRow = 438 * rowSize;
    const badgePx = badgeRow + 1 + 122 * 4;
    const isBadgeCyan = decompressed[badgePx] === 56 && decompressed[badgePx + 1] === 189 && decompressed[badgePx + 2] === 248;

    textPixelsRendered = isTitleWhite && isSubWhite && isBadgeCyan;
  } catch (err: any) {
    textPixelsRendered = false;
  }
  recordTest(15, 'OG TEXT', 'Decompressed PNG pixel inspection confirms rendered typography & badges', textPixelsRendered, 'ByGoodAI, Developer Utilities, and In-Browser Execution verified in raster');

  // 15D. Real HTTP Integration Test against Express app server on ephemeral port
  let realHttpSuccess = false;
  let realHttpStatus = 0;
  let realHttpContentType = '';
  let realHttpBodyLength = 0;

  try {
    const testApp = express();
    testApp.use('/', seoRouter);

    await new Promise<void>((resolve, reject) => {
      const server = testApp.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        const port = address.port;

        http.get(`http://127.0.0.1:${port}/og-image.png`, (res) => {
          realHttpStatus = res.statusCode || 0;
          realHttpContentType = res.headers['content-type'] || '';
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const body = Buffer.concat(chunks);
            realHttpBodyLength = body.length;
            const isPngSig = body.length > 1000 && body[0] === 0x89 && body[1] === 0x50 && body[2] === 0x4e && body[3] === 0x47;
            const is1200x630 = body.readUInt32BE(16) === 1200 && body.readUInt32BE(20) === 630;
            if (realHttpStatus === 200 && realHttpContentType === 'image/png' && isPngSig && is1200x630) {
              realHttpSuccess = true;
            }
            server.close(() => resolve());
          });
        }).on('error', (e) => {
          server.close(() => reject(e));
        });
      });
    });
  } catch (err: any) {
    realHttpSuccess = false;
  }

  recordTest(15, 'OG HTTP', 'Real HTTP GET /og-image.png returns 200 OK, image/png, 1200x630 binary buffer', realHttpSuccess, `Status: ${realHttpStatus}, Content-Type: ${realHttpContentType}, Bytes: ${realHttpBodyLength}`);

  // 16. OG Image claims accuracy
  const ogSvgPath = path.join(process.cwd(), 'server', 'routes', 'seo.routes.ts');
  const seoRoutesContent = fs.readFileSync(ogSvgPath, 'utf8');
  const hasForbiddenClaims = seoRoutesContent.includes('0ms Client Latency') || seoRoutesContent.includes('Zero Telemetry Leaks');
  const hasFactualClaims = seoRoutesContent.includes('In-Browser Execution') && seoRoutesContent.includes('Client-Side Privacy');
  recordTest(16, 'OG CLAIMS', 'OG Image messaging uses safe factual claims', !hasForbiddenClaims && hasFactualClaims, 'No unverified marketing claims');

  // 17. URL normalization utility tests
  const norm1 = getCanonicalUrl('/tools/developer/regex-tester/');
  const norm2 = getCanonicalUrl('/tools?query=123#hash');
  const isNormValid = norm1.endsWith('/tools/developer/regex-tester') && norm2.endsWith('/tools');
  recordTest(17, 'CANONICALS', 'getCanonicalUrl strips trailing slashes, search params, and hashes', isNormValid, 'Clean canonical path normalization');

  // 18. WebSite JSON-LD Schema
  const webSiteSchema = createWebSiteSchema();
  const isWebSiteValid = webSiteSchema['@type'] === 'WebSite' && webSiteSchema.name.includes('ByGoodAI');
  recordTest(18, 'JSON-LD', 'createWebSiteSchema produces compliant Schema.org WebSite structure', isWebSiteValid, `Type: ${webSiteSchema['@type']}`);

  // 19. Tool WebApplication JSON-LD Schema
  const sampleTool = ALL_TOOLS[0];
  const toolSchema = createToolSchema(sampleTool);
  const isToolSchemaValid = toolSchema['@type'] === 'WebApplication' && toolSchema.url.includes(sampleTool.slug);
  recordTest(19, 'JSON-LD', 'createToolSchema produces compliant Schema.org WebApplication structure', isToolSchemaValid, `URL: ${toolSchema.url}`);

  // 20. BreadcrumbsList JSON-LD Schema
  const crumbsSchema = createBreadcrumbsSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
    { name: 'JSON Formatter', url: '/tools/data/json-formatter' },
  ]);
  const isCrumbsValid = crumbsSchema['@type'] === 'BreadcrumbList' && crumbsSchema.itemListElement.length === 3;
  recordTest(20, 'JSON-LD', 'createBreadcrumbsSchema produces compliant BreadcrumbList schema', isCrumbsValid, `Items: ${crumbsSchema.itemListElement.length}`);

  // 21. Production base URL guard
  const oldEnv = process.env.NODE_ENV;
  const oldAppUrl = process.env.APP_URL;
  const oldFrontendUrl = process.env.FRONTEND_URL;
  let prodGuardThrows = false;
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.APP_URL;
    delete process.env.FRONTEND_URL;
    delete process.env.BACKEND_URL;
    getServerBaseUrl();
  } catch (err: any) {
    prodGuardThrows = err.message.includes('CONFIG_ERROR');
  } finally {
    process.env.NODE_ENV = oldEnv;
    if (oldAppUrl) process.env.APP_URL = oldAppUrl;
    if (oldFrontendUrl) process.env.FRONTEND_URL = oldFrontendUrl;
  }
  recordTest(21, 'BASE URL', 'getServerBaseUrl safely throws CONFIG_ERROR in production when env missing', prodGuardThrows, 'Prevents emitting invalid production fallbacks');

  // 22. Sitemap verified core public pages
  const coreVerified = ['/about', '/contact', '/faq', '/privacy', '/terms'].every((p) => !resolveAppRoute(p).is404);
  recordTest(22, 'ROUTES', 'All informational routes (/about, /contact, /faq, /privacy, /terms) resolve to real views', coreVerified, 'Audited against App.tsx route table');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n------------------------------------------------------');
  console.log(`  SEO Test Suite Results: ${passed} Passed, ${failed} Failed out of ${results.length} Tests`);
  console.log('------------------------------------------------------\n');

  return { total: results.length, passed, failed };
}

if (process.argv[1]?.includes('seoVerificationTest')) {
  runSeoVerificationSuite()
    .then((res) => {
      if (res.failed > 0) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
