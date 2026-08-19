import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'indigo';
  className?: string;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  badge,
  badgeVariant = 'secondary',
  className = '',
  onClick,
}) => {
  return (
    <Card
      hoverEffect={!!onClick}
      onClick={onClick}
      className={`p-5 rounded-xl border border-neutral-200/90 bg-white transition-all ${
        onClick ? 'cursor-pointer group hover:border-neutral-400' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
          {icon}
        </div>
        {badge && (
          <Badge variant={badgeVariant} size="sm">
            {badge}
          </Badge>
        )}
      </div>
      <h3 className="text-sm font-bold text-neutral-900 tracking-tight">{title}</h3>
      <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{description}</p>
    </Card>
  );
};
