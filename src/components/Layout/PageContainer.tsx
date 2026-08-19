import React, { useEffect } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { BreadcrumbItem } from '../../types';
import { generateSeoMetadata } from '../../lib/seo';

export interface PageContainerProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  breadcrumbs,
  onNavigate,
  children,
  maxWidth = '7xl',
  className = '',
}) => {
  useEffect(() => {
    if (title) {
      const meta = generateSeoMetadata({ title, description });
      document.title = meta.title;
    }
  }, [title, description]);

  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <main className={`mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 ${maxWidths[maxWidth]} ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
      )}
      {children}
    </main>
  );
};
