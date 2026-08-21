/**
 * ByGoodAI Progressive Web App - Service Worker Registration Manager
 * Production-only registration with safe error handling and update lifecycle hooks.
 */

export function registerServiceWorker(): void {
  // Only register service worker in production environments
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Development check: do not register in development to avoid stale caching during active dev
  const isProduction =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) ||
    process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.debug('[ByGoodAI PWA] Development mode: Service worker registration skipped');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.debug('[ByGoodAI PWA] Service worker registered successfully:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.debug('[ByGoodAI PWA] New content is available; will be used when all tabs are closed.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[ByGoodAI PWA] Service worker registration failed:', error);
      });
  });
}

export function unregisterServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.warn('[ByGoodAI PWA] Service worker unregistration failed:', error);
      });
  }
}
