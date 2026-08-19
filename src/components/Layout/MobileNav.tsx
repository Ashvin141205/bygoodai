/**
 * ByGoodAI Frontend - Responsive Mobile Navigation Drawer
 * Synchronized with AuthContext for instant authenticated vs guest presentation.
 */

import React, { useEffect } from 'react';
import {
  X,
  Search,
  Terminal,
  Layers,
  Bookmark,
  CreditCard,
  ChevronRight,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { db } from '../../db/client';
import { useAuth } from '../../context/AuthContext';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const categories = db.getCategories();
  const savedCount = db.getSavedItems().length;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-sm">
              Ω
            </div>
            <div>
              <span className="font-extrabold text-sm text-neutral-900">{APP_CONFIG.shortName}</span>
              <Badge variant="indigo" size="sm" className="ml-1.5">v{APP_CONFIG.version}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-neutral-500 hover:text-neutral-900">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Search Launcher */}
        <div className="my-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <span>Search tools & docs...</span>
            </div>
            <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Links List */}
        <div className="flex-1 overflow-y-auto space-y-5 py-2">
          {/* Main Links */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5">Platform</h4>
            <button
              type="button"
              onClick={() => handleNav('/')}
              className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                currentPath === '/' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>Home Overview</span>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
            <button
              type="button"
              onClick={() => handleNav('/tools')}
              className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                currentPath.startsWith('/tools') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>All Tools Directory</span>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
            <button
              type="button"
              onClick={() => handleNav('/dashboard')}
              className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                currentPath === '/dashboard' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>Workstation & History</span>
              {savedCount > 0 && <Badge variant="secondary" size="sm">{savedCount} saved</Badge>}
            </button>
            <button
              type="button"
              onClick={() => handleNav('/docs')}
              className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                currentPath === '/docs' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>Docs & API</span>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
            <button
              type="button"
              onClick={() => handleNav('/blog')}
              className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                currentPath.startsWith('/blog') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>Engineering Blog</span>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
            <button
              type="button"
              onClick={() => handleNav('/pricing')}
              className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                currentPath === '/pricing' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>Pricing Tiers</span>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          </div>

          {/* Authenticated Links */}
          {isAuthenticated && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5">Account & Workspace</h4>
              <button
                type="button"
                onClick={() => handleNav('/profile')}
                className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Profile Information</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </button>
              <button
                type="button"
                onClick={() => handleNav('/settings')}
                className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Workspace Settings</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNav('/admin')}
                  className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-rose-600" />
                    <span>Admin Telemetry</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-rose-400" />
                </button>
              )}
            </div>
          )}

          {/* Categories Grid */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5">Tool Categories</h4>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleNav(`/tools/${cat.slug}`)}
                className="flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full font-mono">
                  {cat.toolCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer User Profile / Auth Actions */}
        <div className="border-t border-neutral-100 pt-3 mt-auto">
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name || user.email}</p>
                    <p className="text-[10px] text-indigo-600 font-semibold">{user.plan} Plan</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-neutral-500 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenAuth('login');
                }}
              >
                <LogIn className="h-3.5 w-3.5 mr-1" />
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenAuth('register');
                }}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
