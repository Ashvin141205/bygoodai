import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  const [internalActive, setInternalActive] = React.useState<string>(
    activeTab || (tabs.length > 0 ? tabs[0].id : '')
  );

  const currentTabId = activeTab !== undefined ? activeTab : internalActive;

  const handleTabClick = (id: string) => {
    if (activeTab === undefined) {
      setInternalActive(id);
    }
    onChange?.(id);
  };

  const activeContent = tabs.find((t) => t.id === currentTabId)?.content;

  if (variant === 'segmented') {
    return (
      <div className="space-y-4">
        <div className={cn('inline-flex items-center rounded-lg bg-neutral-100 p-1 text-neutral-600', className)}>
          {tabs.map((tab) => {
            const isActive = tab.id === currentTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="rounded-full bg-neutral-200 px-1.5 py-0.2 text-[10px] text-neutral-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {activeContent && <div>{activeContent}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn('flex border-b border-neutral-200 gap-6', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === currentTabId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap',
                isActive
                  ? 'text-neutral-900 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600 font-medium">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      {activeContent && <div>{activeContent}</div>}
    </div>
  );
};
