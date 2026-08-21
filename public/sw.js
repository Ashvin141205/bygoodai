/**
 * ByGoodAI Progressive Web App - Production Service Worker
 * Version: bygoodai-static-v1
 * 
 * Safety Rules:
 * 1. GET requests only for caching
 * 2. Zero caching of private API endpoints (/api/*), auth sessions, billing, or webhooks
 * 3. Network-first for navigation with /offline.html fallback
 * 4. Stale-While-Revalidate for static immutable application assets
 * 5. Safe cache versioning and lifecycle management
 */

const CACHE_VERSION = 'v1';
const CACHE_PREFIX = 'bygoodai-';
const STATIC_CACHE_NAME = `${CACHE_PREFIX}static-${CACHE_VERSION}`;

// Essential static shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Explicit list of path prefixes that MUST NEVER be cached
const FORBIDDEN_CACHE_PREFIXES = [
  '/api/',
  '/api/auth',
  '/api/user',
  '/api/profile',
  '/api/billing',
  '/api/payment',
  '/api/developer',
  '/api/keys',
  '/api/billing/razorpay/webhook',
];

// Check if a URL should bypass service worker cache completely
function isCacheExempt(url) {
  const pathname = url.pathname;
  for (const prefix of FORBIDDEN_CACHE_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }
  
  // Also bypass external payment and non-same-origin dynamic APIs
  if (url.hostname.includes('razorpay.com') || url.hostname.includes('google.com')) {
    return true;
  }

  return false;
}

// Service Worker Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate immediately once installed
        return self.skipWaiting();
      })
      .catch((error) => {
        console.warn('[ByGoodAI SW] Pre-cache installation warning:', error);
      })
  );
});

// Service Worker Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old ByGoodAI caches that do not match current version
            if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== STATIC_CACHE_NAME) {
              console.log('[ByGoodAI SW] Removing obsolete cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        // Claim active clients to take control immediately
        return self.clients.claim();
      })
  );
});

// Service Worker Fetch Event
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Rule 1: Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Rule 2: Strictly bypass all private APIs, webhooks, auth, and billing
  if (isCacheExempt(url)) {
    return;
  }

  // Rule 3: Navigation Requests (HTML pages) -> Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If network succeeds and is valid, return it
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed (offline / network error)
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Serve offline fallback page
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) {
            return offlinePage;
          }
          return new Response('You are offline. Please check your internet connection.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // Rule 4: Static assets (JS, CSS, Images, Fonts, Icons) -> Stale-While-Revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.ico') ||
      url.pathname === '/manifest.webmanifest')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: pass through to standard network fetch
});
