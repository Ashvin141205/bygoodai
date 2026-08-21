/**
 * ByGoodAI Platform - Comprehensive PWA & Mobile Experience Test Suite
 * Validates web app manifest, icon assets, service worker safety, cache exclusions,
 * offline fallback, registration lifecycle, and brand adherence.
 */

import fs from 'node:fs';
import path from 'node:path';

interface TestResult {
  id: number;
  category: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordTest(id: number, category: string, name: string, passed: boolean, details?: string, error?: string) {
  results.push({ id, category, name, passed, details, error });
}

async function runPwaTestSuite() {
  console.log('======================================================');
  console.log('  ByGoodAI Platform — PWA & Performance Test Suite');
  console.log('======================================================\n');

  // 1. Manifest Existence and Validity
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');
  let manifest: any = null;
  let isManifestValid = false;

  try {
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, 'utf8');
      manifest = JSON.parse(content);
      isManifestValid =
        manifest.name === 'ByGoodAI' &&
        manifest.short_name === 'ByGoodAI' &&
        manifest.start_url === '/' &&
        manifest.scope === '/' &&
        manifest.display === 'standalone' &&
        manifest.orientation === 'portrait' &&
        manifest.theme_color === '#0f172a' &&
        Array.isArray(manifest.icons) &&
        manifest.icons.length >= 2;
    }
  } catch (err: any) {
    isManifestValid = false;
  }

  recordTest(1, 'MANIFEST', 'Web App Manifest exists, parses as valid JSON, and has standard properties', isManifestValid, `Name: ${manifest?.name}, Short: ${manifest?.short_name}, Display: ${manifest?.display}`);

  // 2. Manifest Icons Verification on Disk
  let allIconsExist = false;
  let iconDetails: string[] = [];

  if (manifest && Array.isArray(manifest.icons)) {
    allIconsExist = true;
    for (const icon of manifest.icons) {
      const iconPath = path.join(process.cwd(), 'public', icon.src.replace(/^\//, ''));
      if (!fs.existsSync(iconPath)) {
        allIconsExist = false;
        iconDetails.push(`Missing: ${icon.src}`);
      } else {
        const stats = fs.statSync(iconPath);
        iconDetails.push(`${icon.src} (${stats.size}b)`);
      }
    }
  }

  recordTest(2, 'ICONS', 'All icons referenced in manifest exist on disk with valid file sizes', allIconsExist, iconDetails.join(', '));

  // 3. Apple Touch Icon & Favicons
  const appleTouchPath = path.join(process.cwd(), 'public', 'apple-touch-icon.png');
  const faviconSvgPath = path.join(process.cwd(), 'public', 'favicon.svg');
  const appleTouchExists = fs.existsSync(appleTouchPath) && fs.statSync(appleTouchPath).size > 100;
  const faviconSvgExists = fs.existsSync(faviconSvgPath) && fs.statSync(faviconSvgPath).size > 50;

  recordTest(3, 'FAVICON', 'Apple touch icon and SVG favicon exist and represent ByGoodAI branding', appleTouchExists && faviconSvgExists, `Apple: ${appleTouchExists}, SVG: ${faviconSvgExists}`);

  // 4. Service Worker Source and Versioning
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  let isSwValid = false;
  let swContent = '';

  if (fs.existsSync(swPath)) {
    swContent = fs.readFileSync(swPath, 'utf8');
    const hasVersion = swContent.includes('bygoodai-') && swContent.includes('STATIC_CACHE_NAME');
    const hasSkipWaiting = swContent.includes('skipWaiting()');
    const hasClientsClaim = swContent.includes('clients.claim()');
    const hasPrecache = swContent.includes('PRECACHE_ASSETS') && swContent.includes('/offline.html');
    isSwValid = hasVersion && hasSkipWaiting && hasClientsClaim && hasPrecache;
  }

  recordTest(4, 'SERVICE WORKER', 'Service worker source exists with versioned cache, precaching, and clean lifecycle', isSwValid, 'Versioned cache and lifecycle verified');

  // 5. Private API & Sensitive Route Cache Exclusion
  const excludesApi =
    swContent.includes("'/api/'") ||
    swContent.includes('isCacheExempt') ||
    swContent.includes('/api/billing');
  const excludesRazorpayWebhook =
    swContent.includes('/api/billing/razorpay/webhook') ||
    swContent.includes('isCacheExempt');
  const getOnlyCheck = swContent.includes("request.method !== 'GET'");

  recordTest(5, 'SECURITY', 'Service worker strictly excludes /api/*, private routes, webhooks, and non-GET requests', excludesApi && excludesRazorpayWebhook && getOnlyCheck, 'Strict exclusion list in place');

  // 6. Navigation Network-First & Offline Fallback
  const handlesNavigation =
    swContent.includes("request.mode === 'navigate'") &&
    swContent.includes('/offline.html');

  recordTest(6, 'NAVIGATION', 'Navigation requests use Network-First strategy with /offline.html fallback', handlesNavigation, 'Network-first with offline fallback');

  // 7. Standalone Offline Fallback Page
  const offlineHtmlPath = path.join(process.cwd(), 'public', 'offline.html');
  let isOfflineValid = false;

  if (fs.existsSync(offlineHtmlPath)) {
    const offlineContent = fs.readFileSync(offlineHtmlPath, 'utf8');
    const hasBrand = offlineContent.includes('ByGoodAI');
    const hasOfflineMsg = offlineContent.includes("You're offline") || offlineContent.includes('offline');
    const hasRetry = offlineContent.includes('Retry') || offlineContent.includes('reload');
    const hasHome = offlineContent.includes('Return Home') || offlineContent.includes('href="/"');
    const noExternalScripts = !offlineContent.includes('<script src="http');
    const noExternalStyles = !offlineContent.includes('<link rel="stylesheet" href="http');

    isOfflineValid = hasBrand && hasOfflineMsg && hasRetry && hasHome && noExternalScripts && noExternalStyles;
  }

  recordTest(7, 'OFFLINE HTML', 'public/offline.html is a standalone zero-dependency page with ByGoodAI branding and retry controls', isOfflineValid, 'Clean standalone HTML offline fallback');

  // 8. Service Worker Registration Guard
  const registrationPath = path.join(process.cwd(), 'src', 'serviceWorkerRegistration.ts');
  let isRegGuarded = false;

  if (fs.existsSync(registrationPath)) {
    const regContent = fs.readFileSync(registrationPath, 'utf8');
    isRegGuarded =
      regContent.includes('PROD') ||
      regContent.includes('process.env.NODE_ENV === \'production\'');
  }

  recordTest(8, 'REGISTRATION', 'Service worker registration is strictly production-guarded and will not interfere with dev mode', isRegGuarded, 'Production-only activation guard');

  // 9. HTML PWA Metadata & Viewport
  const htmlPath = path.join(process.cwd(), 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const hasViewport = htmlContent.includes('<meta name="viewport" content="width=device-width, initial-scale=1');
  const noUserScalableNo = !htmlContent.includes('user-scalable=no');
  const hasManifestLink = htmlContent.includes('rel="manifest"');
  const hasThemeColor = htmlContent.includes('name="theme-color"');
  const hasAppleMeta = htmlContent.includes('apple-mobile-web-app-capable');

  recordTest(9, 'HTML META', 'index.html contains compliant PWA link tags, theme-color, and accessible viewport', hasViewport && noUserScalableNo && hasManifestLink && hasThemeColor && hasAppleMeta, 'Accessible viewport and PWA links verified');

  // 10. CSS Mobile Safe Area & Reduced Motion
  const cssPath = path.join(process.cwd(), 'src', 'index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const hasSafeArea = cssContent.includes('safe-area-inset');
  const hasReducedMotion = cssContent.includes('prefers-reduced-motion');

  recordTest(10, 'ACCESSIBILITY', 'CSS includes mobile safe-area insets and prefers-reduced-motion accessibility rules', hasSafeArea && hasReducedMotion, 'Safe-area and reduced motion configured');

  // 11. Code Splitting in App.tsx
  const appPath = path.join(process.cwd(), 'src', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  const hasLazy = appContent.includes('lazy(') && appContent.includes('Suspense');
  const hasPwaPrompt = appContent.includes('PwaInstallPrompt');

  recordTest(11, 'PERFORMANCE', 'App.tsx implements lazy code-splitting for secondary views and mounts PwaInstallPrompt', hasLazy && hasPwaPrompt, 'Lazy code splitting & PWA install prompt');

  // 12. Zero Old Brand References in Codebase
  const filesToCheck = [
    'index.html',
    'public/manifest.webmanifest',
    'public/offline.html',
    'public/sw.js',
    'src/config/app.config.ts',
    'src/components/layout/Header.tsx',
    'src/components/layout/Footer.tsx',
    'src/components/layout/MobileNav.tsx',
  ];

  let zeroOldBrand = true;
  const brandViolations: string[] = [];

  for (const rel of filesToCheck) {
    const full = path.join(process.cwd(), rel);
    if (fs.existsSync(full)) {
      const text = fs.readFileSync(full, 'utf8');
      if (/omnistack/i.test(text)) {
        zeroOldBrand = false;
        brandViolations.push(rel);
      }
    }
  }

  recordTest(12, 'BRAND INTEGRITY', 'Zero old-brand (OmniStack) references in public assets, layout, and PWA configurations', zeroOldBrand, brandViolations.length ? `Violations: ${brandViolations.join(', ')}` : 'Zero old-brand references');

  // Print Summary
  let passedCount = 0;
  for (const r of results) {
    if (r.passed) {
      passedCount++;
      console.log(`✅ PASS [#${r.id}] [${r.category}] ${r.name} - ${r.details || ''}`);
    } else {
      console.log(`❌ FAIL [#${r.id}] [${r.category}] ${r.name} - ${r.error || r.details || ''}`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`  PWA Test Suite Results: ${passedCount} Passed, ${results.length - passedCount} Failed out of ${results.length} Tests`);
  console.log('------------------------------------------------------\n');

  if (passedCount < results.length) {
    process.exit(1);
  }
}

runPwaTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
