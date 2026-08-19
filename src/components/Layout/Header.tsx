/**
 * ByGoodAI Frontend - Navigation Header
 * Dynamic user authentication state presentation, category menu, command palette trigger,
 * and responsive navigation controls.
 */

import React from 'react';
import {
  Search,
  Bookmark,
  ChevronDown,
  Layers,
  Terminal,
  CreditCard,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  Menu,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { db } from '../../db/client';
import { useAuth } from '../../context/AuthContext';

export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
  onOpenMobileNav,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const savedCount = db.getSavedItems().length;
  const categories = db.getCategories();

  const categoryDropdownItems = [
    {
      label: 'All Categories Overview',
      onClick: () => onNavigate('/tools'),
      icon: <Layers className="h-4 w-4" />,
    },
    { divider: true, label: '', onClick: () => {} },
    ...categories.map((cat) => ({
      label: `${cat.name} (${cat.toolCount})`,
      onClick: () => onNavigate(`/tools/${cat.slug}`),
    })),
  ];

  const userDropdownItems = [
    {
      label: 'Developer Workstation',
      onClick: () => onNavigate('/dashboard'),
      icon: <Terminal className="h-4 w-4" />,
    },
    {
      label: 'Saved Bookmarks',
      onClick: () => onNavigate('/dashboard?tab=saved'),
      icon: <Bookmark className="h-4 w-4" />,
    },
    {
      label: 'Account Profile',
      onClick: () => onNavigate('/profile'),
      icon: <UserIcon className="h-4 w-4" />,
    },
    {
      label: 'Workspace Settings',
      onClick: () => onNavigate('/settings'),
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: 'Billing & Invoices',
      onClick: () => onNavigate('/billing'),
      icon: <CreditCard className="h-4 w-4 text-emerald-600" />,
    },
    ...(isAdmin
      ? [
          {
            label: 'System Admin Panel',
            onClick: () => onNavigate('/admin'),
            icon: <Shield className="h-4 w-4 text-rose-600" />,
          },
        ]
      : []),
    {
      label: 'Upgrade / Pricing Plans',
      onClick: () => onNavigate('/pricing'),
      icon: <CreditCard className="h-4 w-4" />,
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: 'Sign Out',
      onClick: async () => {
        await logout();
      },
      icon: <LogOut className="h-4 w-4 text-neutral-500" />,
    },
  ];

  const isRouteActive = (route: string) => {
    if (route === '/') return currentPath === '';
    return currentPath.startsWith(route);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-7">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-lg p-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold tracking-wider text-base shadow-xs group-hover:bg-neutral-800 transition-colors">
              Ω
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-neutral-900">{APP_CONFIG.shortName}</span>
                <Badge variant="indigo" size="sm">v{APP_CONFIG.version}</Badge>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono tracking-tight block -mt-0.5">Zero-Telemetry Tools</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => onNavigate('/tools')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isRouteActive('/tools') && !currentPath.includes('/tools/')
                  ? 'bg-neutral-100 text-neutral-950 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Explore Tools
            </button>

            {/* Categories Dropdown */}
            <Dropdown
              trigger={
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentPath.startsWith('/tools/')
                      ? 'bg-neutral-100 text-neutral-950 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                </button>
              }
              items={categoryDropdownItems}
              align="left"
            />

            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isRouteActive('/dashboard')
                  ? 'bg-neutral-100 text-neutral-950 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Workstation
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isRouteActive('/docs')
                  ? 'bg-neutral-100 text-neutral-950 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Docs / API
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/blog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isRouteActive('/blog')
                  ? 'bg-neutral-100 text-neutral-950 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Blog
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/pricing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isRouteActive('/pricing')
                  ? 'bg-neutral-100 text-neutral-950 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Pricing
            </button>
          </nav>
        </div>

        {/* Right: Search Bar, Bookmarks, User Account Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 hover:border-neutral-300 hover:bg-white hover:text-neutral-800 transition-all cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-neutral-900"
            aria-label="Search tools and documentation"
          >
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Search tools & docs...</span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-neutral-200 bg-white px-1.5 text-[10px] font-mono text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Bookmarks Quick Pill */}
          <button
            type="button"
            onClick={() => onNavigate('/dashboard?tab=saved')}
            className="hidden sm:flex relative items-center justify-center h-9 w-9 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer"
            aria-label="View saved bookmarks"
          >
            <Bookmark className="h-4 w-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* Dynamic Authentication Controls */}
          {isAuthenticated && user ? (
            /* Authenticated User Menu */
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-neutral-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  aria-label="User account menu"
                >
                  <Avatar name={user.name || user.email} src={user.avatarUrl || undefined} size="sm" />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-neutral-900 truncate max-w-[100px]">
                      {user.name ? user.name.split(' ')[0] : user.email.split('@')[0]}
                    </span>
                    <span className="text-[9px] font-semibold text-indigo-600 uppercase tracking-wider">
                      {user.plan}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400 hidden md:block" />
                </button>
              }
              items={userDropdownItems}
              align="right"
            />
          ) : (
            /* Guest Sign In & Register Buttons */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth('login')}
                className="text-xs font-semibold text-neutral-700"
              >
                <LogIn className="h-3.5 w-3.5 mr-1" />
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth('register')}
                className="text-xs font-semibold shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenMobileNav}
            className="lg:hidden h-9 w-9"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
