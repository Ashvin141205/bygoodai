import React from 'react';
import { Card, CardContent } from './Card';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  trendPositive,
  icon,
  className = '',
}) => {
  return (
    <Card className={`border-neutral-200/90 bg-white ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{label}</span>
          {icon && <div className="text-neutral-400">{icon}</div>}
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-neutral-900 font-mono tracking-tight">{value}</p>
          {trend && (
            <span
              className={`text-[11px] font-semibold ${
                trendPositive ? 'text-emerald-600' : 'text-neutral-500'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
        {subtext && <p className="text-[11px] text-neutral-400 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
};
