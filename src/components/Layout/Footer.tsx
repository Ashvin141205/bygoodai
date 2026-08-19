import React from 'react';
import { APP_CONFIG } from '../../config/app.config';
import { Badge } from '../ui/Badge';
import { Activity, Shield, Terminal, ArrowUpRight } from 'lucide-react';

export interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-neutral-200/80 bg-neutral-50/50 text-neutral-600 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-sm shadow-xs">
                Ω
              </div>
              <span className="font-bold text-base tracking-tight text-neutral-900">{APP_CONFIG.name}</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              {APP_CONFIG.description} All tools execute safely within your browser with zero latency and robust privacy.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Operational (99.98%)</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">Node v22 • React 19</span>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              {APP_CONFIG.footerLinks.platform.map((link, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.href)}
                    className="hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              {APP_CONFIG.footerLinks.categories.map((link, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.href)}
                    className="hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-3">Resources</h4>
            <ul className="space-y-2 text-xs">
              {APP_CONFIG.footerLinks.resources.map((link, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.href)}
                    className="hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {APP_CONFIG.footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.href)}
                    className="hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. Built with precision for developers.</p>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => onNavigate('/privacy')} className="hover:text-neutral-700 cursor-pointer">
              Privacy Policy
            </button>
            <button type="button" onClick={() => onNavigate('/terms')} className="hover:text-neutral-700 cursor-pointer">
              Terms of Service
            </button>
            <button type="button" onClick={() => onNavigate('/admin')} className="hover:text-neutral-700 cursor-pointer">
              System Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
