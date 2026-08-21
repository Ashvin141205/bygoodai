# ByGoodAI Progressive Web App (PWA) & Performance Architecture

This document details the Progressive Web App (PWA) architecture, caching strategies, mobile responsiveness, offline resilience, and performance considerations implemented in the ByGoodAI platform.

---

## 1. Overview & Core Principles

ByGoodAI is engineered as a modern, installable, offline-resilient Progressive Web App (PWA).

### Core Pillars
1. **Zero Compromise on Private Data**: Sensitive authentication sessions, JWT tokens, API keys, personalized user dashboards, profile endpoints, and Razorpay billing/webhook endpoints are **never** persisted in Cache Storage.
2. **Safe Offline Fallback**: In-browser client-side developer utilities (e.g. JSON Formatter, Base64 Encoder, Regex Tester) continue functioning offline once loaded. For server-dependent pages, navigation gracefully falls back to a standalone `/offline.html` view.
3. **Standards-Based Web App Manifest**: Supports desktop (Chrome, Edge) and mobile (Android, iOS Safari) standalone installation with valid 192x192, 512x512, maskable icons, and Apple touch icons.
4. **Production-Only Service Worker**: The service worker is registered strictly in production (`import.meta.env.PROD`), keeping development environments fast, hot, and free of stale caches.

---

## 2. Web App Manifest (`/manifest.webmanifest`)

The manifest is served at `/manifest.webmanifest` with the following configuration:

```json
{
  "name": "ByGoodAI",
  "short_name": "ByGoodAI",
  "description": "High-performance in-browser developer utilities, data converters, security encoders, and APIs.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0f172a",
  "background_color": "#0f172a",
  "categories": ["developer", "productivity", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

---

## 3. Service Worker & Caching Strategy (`public/sw.js`)

The service worker is versioned (`bygoodai-static-v1`) and utilizes distinct caching strategies per resource type:

| Resource Type | Strategy | Description |
| :--- | :--- | :--- |
| **Navigation (`request.mode === 'navigate'`)** | **Network-First** | Tries the live network first. If offline, serves cached document or falls back to `/offline.html`. |
| **Static Immutable Assets (`/assets/*`, `.js`, `.css`, `.svg`, `.png`, `.woff2`)** | **Stale-While-Revalidate** | Serves cached asset instantly while validating/updating against network in background. |
| **Private APIs (`/api/auth/*`, `/api/billing/*`, `/api/user/*`, `/api/profile/*`, `/api/developer/*`)** | **Network-Only (Bypass Cache)** | Strictly excluded from service worker caching. Never cached under any circumstances. |
| **Razorpay Webhooks & Checkout** | **Bypass Cache** | Excluded from cache handling to guarantee secure cryptographic verification. |
| **Non-GET HTTP Methods (`POST`, `PUT`, `DELETE`, `PATCH`)** | **Network-Only** | Only `GET` requests are processed by the service worker. |

---

## 4. Offline Resilience

- **Standalone Offline Page (`/offline.html`)**: Built with zero external dependencies (no external fonts, scripts, or stylesheets) to ensure guaranteed rendering even in airplane mode.
- **Client-Side Browser Execution**: Tools running purely in JavaScript (Regex tester, JSON formatter, Hash generators, Base64 converters) remain fully functional in memory without internet connectivity.
- **Retry Controls**: The offline screen provides clear "Retry Connection" and "Return Home" actions.

---

## 5. Performance & Mobile UX

- **Route Code Splitting**: Secondary views (`DashboardView`, `BillingView`, `DocsView`, `BlogView`, `BlogPostView`, `AdminView`, `SettingsView`, `ProfileView`, `LegalView`) are dynamically lazy-loaded via `React.lazy` and `Suspense`, minimizing the critical initial JavaScript bundle.
- **Mobile Safe Area**: Integrated CSS `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for borderless mobile displays and notches.
- **Input Zoom Prevention**: Input font sizes on mobile viewports are set to a minimum of 16px to prevent intrusive iOS Safari zooming.
- **Reduced Motion Support**: Honored via `@media (prefers-reduced-motion: reduce)` in `src/index.css`.
- **Install Banner (`PwaInstallPrompt.tsx`)**: Listens to standard `beforeinstallprompt` event and presents a non-intrusive banner that can be dismissed (cached for 7 days in `localStorage`).

---

## 6. How to Clear Stale Caches in Development

During local development or testing:
1. Open DevTools (`F12` or `Cmd + Option + I`).
2. Go to **Application** &rarr; **Service Workers** &rarr; click **Unregister**.
3. Go to **Application** &rarr; **Storage** &rarr; click **Clear site data**.
