/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { QuickSearchModal } from './components/navigation/QuickSearchModal';
import { AuthModal } from './components/navigation/AuthModal';
import { PwaInstallPrompt } from './components/ui/PwaInstallPrompt';

// Eagerly loaded critical first-visit views for instantaneous LCP
import { HomeView } from './views/HomeView';
import { ToolsDirectoryView } from './views/ToolsDirectoryView';
import { ToolWorkstationView } from './views/ToolWorkstationView';
import { PricingView } from './views/PricingView';
import { NotFoundView } from './views/NotFoundView';

// Lazily loaded secondary views to reduce initial bundle size
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const BillingView = lazy(() => import('./views/BillingView').then(m => ({ default: m.BillingView })));
const DocsView = lazy(() => import('./views/DocsView').then(m => ({ default: m.DocsView })));
const BlogView = lazy(() => import('./views/BlogView').then(m => ({ default: m.BlogView })));
const BlogPostView = lazy(() => import('./views/BlogPostView').then(m => ({ default: m.BlogPostView })));
const AdminView = lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));
const ProfileView = lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const LegalView = lazy(() => import('./views/LegalView').then(m => ({ default: m.LegalView })));

import { db } from './db/client';

const ViewLoadingFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh] p-8">
    <div className="flex flex-col items-center gap-3 text-neutral-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-sky-500" />
      <span className="text-xs font-mono">Loading view...</span>
    </div>
  </div>
);

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [searchParams, setSearchParams] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search || '';
    }
    return '';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [, setForceUpdate] = useState(0);

  // Sync state on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global keyboard shortcuts (Command/Control + K for quick search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation handler
  const handleNavigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      const [pathname, search] = path.split('?');
      window.history.pushState({}, '', path);
      setCurrentPath(pathname || '/');
      setSearchParams(search ? `?${search}` : '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleOpenAuth = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const handleUserChange = useCallback(() => {
    setForceUpdate((prev) => prev + 1);
  }, []);

  // View resolution
  const renderView = useMemo(() => {
    const cleanPath = currentPath.replace(/\/+$/, '') || '/';

    // 1. Home
    if (cleanPath === '/') {
      return (
        <HomeView
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      );
    }

    // 2. Tools Directory Root & Category Hubs
    if (cleanPath === '/tools' || cleanPath === '/categories') {
      return (
        <ToolsDirectoryView
          initialCategory="all"
          onNavigate={handleNavigate}
        />
      );
    }

    if (cleanPath.startsWith('/categories/')) {
      const catParam = cleanPath.replace('/categories/', '').split('/')[0];
      const category = db.getCategoryBySlug(catParam);
      if (category || catParam === 'all') {
        return (
          <ToolsDirectoryView
            initialCategory={catParam}
            onNavigate={handleNavigate}
          />
        );
      }
      return (
        <NotFoundView
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      );
    }

    // 3. Tools Sub-Routes (/tools/:category or /tools/:category/:toolSlug or /tools/:toolSlug)
    if (cleanPath.startsWith('/tools/')) {
      const segments = cleanPath.split('/').filter(Boolean);
      if (segments.length === 2) {
        const param = segments[1];
        const tool = db.getToolBySlug(param);
        if (tool) {
          return (
            <ToolWorkstationView
              toolSlug={param}
              onNavigate={handleNavigate}
            />
          );
        }
        const category = db.getCategoryBySlug(param);
        if (category || param === 'all') {
          return (
            <ToolsDirectoryView
              initialCategory={param}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <NotFoundView
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
      } else if (segments.length >= 3) {
        const toolSlug = segments[2];
        const tool = db.getToolBySlug(toolSlug);
        if (tool) {
          return (
            <ToolWorkstationView
              toolSlug={toolSlug}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <NotFoundView
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
      }
    }

    // 4. Dashboard (with tab search param)
    if (cleanPath === '/dashboard') {
      const queryParams = new URLSearchParams(searchParams);
      const tab = queryParams.get('tab') || 'history';
      return (
        <DashboardView
          initialTab={tab}
          onNavigate={handleNavigate}
          onOpenAuth={() => handleOpenAuth('login')}
        />
      );
    }

    // 5. User Profile
    if (cleanPath === '/profile') {
      return (
        <ProfileView
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      );
    }

    // 6. Workspace Settings
    if (cleanPath === '/settings') {
      return (
        <SettingsView
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      );
    }

    // 7. Pricing
    if (cleanPath === '/pricing') {
      return (
        <PricingView
          onNavigate={handleNavigate}
          onOpenAuth={() => handleOpenAuth('register')}
        />
      );
    }

    // 7.5. Billing & Subscription Management
    if (cleanPath === '/billing') {
      return (
        <BillingView
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      );
    }

    // 8. Docs & API Testbed
    if (cleanPath === '/docs') {
      return (
        <DocsView
          onNavigate={handleNavigate}
        />
      );
    }

    // 9. Blog Directory & Post Detail
    if (cleanPath === '/blog') {
      return (
        <BlogView
          onNavigate={handleNavigate}
        />
      );
    }

    if (cleanPath.startsWith('/blog/')) {
      const slug = cleanPath.replace('/blog/', '').split('/')[0];
      return (
        <BlogPostView
          slug={slug}
          onNavigate={handleNavigate}
        />
      );
    }

    // 10. Admin Telemetry Panel
    if (cleanPath === '/admin') {
      return (
        <AdminView
          onNavigate={handleNavigate}
        />
      );
    }

    // 11. Legal & Static Informational Pages
    if (cleanPath === '/privacy') {
      return <LegalView type="privacy" onNavigate={handleNavigate} />;
    }
    if (cleanPath === '/terms') {
      return <LegalView type="terms" onNavigate={handleNavigate} />;
    }
    if (cleanPath === '/about') {
      return <LegalView type="about" onNavigate={handleNavigate} />;
    }
    if (cleanPath === '/contact') {
      return <LegalView type="contact" onNavigate={handleNavigate} />;
    }
    if (cleanPath === '/faq') {
      return <LegalView type="faq" onNavigate={handleNavigate} />;
    }

    // 12. 404 Fallback
    return (
      <NotFoundView
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    );
  }, [currentPath, searchParams, handleNavigate, handleOpenAuth]);

  return (
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary>
          <div id="bygoodai-app-root" className="min-h-screen flex flex-col bg-neutral-50/30 text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
            <Header
              currentPath={currentPath}
              onNavigate={handleNavigate}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenAuth={handleOpenAuth}
              onOpenMobileNav={() => setIsMobileNavOpen(true)}
            />

            <div className="flex-1 flex flex-col">
              <Suspense fallback={<ViewLoadingFallback />}>
                {renderView}
              </Suspense>
            </div>

            <Footer onNavigate={handleNavigate} />

            {/* Optional PWA Standalone App Install Banner */}
            <PwaInstallPrompt />

            {/* Global Navigation & Command Modals */}
            <QuickSearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onNavigate={handleNavigate}
            />

            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              onUserChange={handleUserChange}
              initialMode={authMode}
            />

            <MobileNav
              isOpen={isMobileNavOpen}
              onClose={() => setIsMobileNavOpen(false)}
              currentPath={currentPath}
              onNavigate={handleNavigate}
              onOpenSearch={() => {
                setIsMobileNavOpen(false);
                setIsSearchOpen(true);
              }}
              onOpenAuth={handleOpenAuth}
            />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}
