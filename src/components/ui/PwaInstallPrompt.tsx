import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('bygoodai_pwa_dismissed');
    if (dismissedAt) {
      const parsedTime = parseInt(dismissedAt, 10);
      if (!isNaN(parsedTime) && Date.now() - parsedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent standard browser mini-infobar
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.debug('[ByGoodAI PWA] App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.debug('[ByGoodAI PWA] User accepted the install prompt');
      } else {
        console.debug('[ByGoodAI PWA] User dismissed the install prompt');
        localStorage.setItem('bygoodai_pwa_dismissed', Date.now().toString());
      }
    } catch (err) {
      console.warn('[ByGoodAI PWA] Install prompt error:', err);
    } finally {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('bygoodai_pwa_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Install App Banner"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-300 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white tracking-tight">Install ByGoodAI</h4>
          <p className="mt-0.5 text-xs text-slate-300">
            Install ByGoodAI as a standalone desktop or mobile application for instant access and faster offline-ready developer utilities.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="bg-sky-500 text-slate-950 hover:bg-sky-400 font-semibold px-3 py-1.5 text-xs h-auto min-h-[36px]"
            >
              Install App
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 h-auto min-h-[36px]"
            >
              Not Now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss install banner"
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
