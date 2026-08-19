import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ToolCard } from '../components/tools/ToolCard';
import { ActivityCard } from '../components/ui/ActivityCard';
import { MetricCard } from '../components/ui/MetricCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/client';
import { historyService, HistoryItem } from '../services/historyService';
import { savedToolService, SavedToolItem } from '../services/savedToolService';
import { usageClientService, UsageSummary } from '../services/usageService';
import {
  Terminal,
  Bookmark,
  Clock,
  Settings,
  Trash2,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  User as UserIcon,
  LogIn,
  Sparkles,
  KeyRound,
  Code2,
  BarChart3,
  CreditCard,
} from 'lucide-react';

export interface DashboardViewProps {
  initialTab?: string;
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ initialTab, onNavigate, onOpenAuth }) => {
  const { showToast } = useToast();
  const { user: authUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'saved' | 'usage' | 'settings'>(() => {
    if (initialTab === 'saved' || initialTab === 'settings' || initialTab === 'usage') return initialTab;
    return 'history';
  });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedToolItem[]>([]);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const displayName = authUser?.name || (isAuthenticated ? authUser?.email : 'Guest Sandbox');
  const displayEmail = authUser?.email || 'Local Sandbox Session';
  const displayPlan = isAuthenticated ? (authUser?.plan || 'FREE') : 'GUEST';

  const allTools = db.getTools();

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [fetchedHistory, fetchedSaved, fetchedUsage] = await Promise.all([
        historyService.getHistory(50, isAuthenticated),
        savedToolService.getSavedTools(isAuthenticated),
        usageClientService.getUsage().catch(() => null),
      ]);
      setHistoryItems(fetchedHistory);
      setSavedItems(fetchedSaved);
      if (fetchedUsage) setUsageSummary(fetchedUsage);
    } catch {
      // Fallback
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Find saved tools
  const savedTools = allTools.filter((t) => savedItems.some((s) => s.toolSlug === t.slug));

  const handleClearHistory = async () => {
    await historyService.clearHistory(isAuthenticated);
    setHistoryItems([]);
    showToast('Execution history cleared', 'info');
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await historyService.deleteHistoryItem(id, isAuthenticated);
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed item from history', 'info');
  };

  const handleRerun = (toolSlug: string) => {
    onNavigate(`/tools/${toolSlug}`);
  };

  return (
    <PageContainer
      title="Developer Workstation & Activity Dashboard"
      description="Inspect execution logs, manage bookmarked developer utilities, view API usage quotas, and configure preferences."
      breadcrumbs={[{ label: 'Workstation Dashboard', current: true }]}
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        {/* User Workspace Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white font-extrabold text-lg">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-neutral-900">{displayName}</h1>
                <Badge variant={isAuthenticated ? 'indigo' : 'secondary'} size="sm">
                  {displayPlan} {isAuthenticated ? 'Plan' : 'Mode'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">{displayEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={onOpenAuth}>
                <LogIn className="h-3.5 w-3.5 mr-1" />
                Sign In
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => onNavigate('/billing')}>
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Billing
                </Button>
                <Button variant="outline" size="sm" onClick={() => onNavigate('/settings')}>
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  Settings
                </Button>
              </>
            )}
            <Button variant="primary" size="sm" onClick={() => onNavigate('/tools')}>
              Open Tool Directory
            </Button>
          </div>
        </div>

        {/* Quota & Usage Snapshot */}
        {usageSummary && (
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-neutral-900" />
                <h2 className="text-sm font-bold text-neutral-900">Current Monthly Quotas & Usage</h2>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                Period: {new Date(usageSummary.periodStart).toLocaleDateString()} – {new Date(usageSummary.periodEnd).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* AI Requests */}
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    AI Prompt Optimizations
                  </span>
                  <span className="font-mono text-neutral-900 font-bold">
                    {usageSummary.breakdown.aiRequests.used} / {usageSummary.breakdown.aiRequests.limit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${usageSummary.breakdown.aiRequests.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>{usageSummary.breakdown.aiRequests.remaining} remaining</span>
                  <span>{usageSummary.breakdown.aiRequests.percentage}%</span>
                </div>
              </div>

              {/* Developer API Calls */}
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-emerald-600" />
                    Developer API (/api/v1)
                  </span>
                  <span className="font-mono text-neutral-900 font-bold">
                    {usageSummary.breakdown.apiRequests.used} / {usageSummary.breakdown.apiRequests.limit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${usageSummary.breakdown.apiRequests.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>{usageSummary.breakdown.apiRequests.remaining} remaining</span>
                  <span>{usageSummary.breakdown.apiRequests.percentage}%</span>
                </div>
              </div>

              {/* Web Tool Executions */}
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-600" />
                    Tool Executions
                  </span>
                  <span className="font-mono text-neutral-900 font-bold">
                    {usageSummary.breakdown.toolExecutions.used} / {usageSummary.breakdown.toolExecutions.limit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${usageSummary.breakdown.toolExecutions.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>{usageSummary.breakdown.toolExecutions.remaining} remaining</span>
                  <span>{usageSummary.breakdown.toolExecutions.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Total Executions"
            value={historyItems.length}
            subtext="Persisted execution events"
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            label="Saved Bookmarks"
            value={savedTools.length}
            subtext="Quick-access developer tools"
            icon={<Bookmark className="h-4 w-4" />}
          />
          <MetricCard
            label="API Integration"
            value={isAuthenticated ? 'Active' : 'Sandbox'}
            subtext="Bearer Token Auth (/api/v1)"
            icon={<KeyRound className="h-4 w-4" />}
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-neutral-200/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Execution History ({historyItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved Bookmarks ({savedTools.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('usage')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'usage'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>API & Quota Limits</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Workstation Settings</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Execution History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">
                Recent Tool Executions ({historyItems.length})
              </span>
              {historyItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-xs text-rose-600 hover:bg-rose-50">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear All History
                </Button>
              )}
            </div>

            {isLoadingData ? (
              <div className="py-12 text-center text-xs text-neutral-500">Loading execution records...</div>
            ) : historyItems.length === 0 ? (
              <EmptyState
                icon={<Clock className="h-8 w-8 text-neutral-400" />}
                title="No tool executions recorded yet"
                description="When you execute tools in the workstation, runs will appear here with timing telemetry and quick re-run shortcuts."
                actionLabel="Explore Tools"
                onAction={() => onNavigate('/tools')}
              />
            ) : (
              <div className="space-y-2.5">
                {historyItems.map((item) => (
                  <ActivityCard
                    key={item.id}
                    item={item}
                    onRerun={(toolSlug) => handleRerun(toolSlug)}
                    onDelete={(id) => handleDeleteHistoryItem(id)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Bookmarks */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">
                Bookmarked Utilities ({savedTools.length})
              </span>
            </div>

            {isLoadingData ? (
              <div className="py-12 text-center text-xs text-neutral-500">Loading bookmarks...</div>
            ) : savedTools.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="h-8 w-8 text-neutral-400" />}
                title="No bookmarked developer tools"
                description="Click the bookmark icon on any tool workstation to pin your favorite formatters and validators here for rapid access."
                actionLabel="Browse Tool Directory"
                onAction={() => onNavigate('/tools')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedTools.map((tool) => (
                  <ToolCard
                    key={tool.slug}
                    tool={tool}
                    onNavigate={onNavigate}
                    onBookmarkChange={loadData}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Usage & Quotas */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">API & AI Usage Limits</CardTitle>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Your usage limits reset on the 1st of every calendar month (UTC).
                    </p>
                  </div>
                  <Badge variant="indigo" size="sm">
                    {displayPlan} Plan
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between bg-white text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block">AI Prompt Architecture & LLM Calls</span>
                      <span className="text-neutral-500 text-[11px]">Gemini 3.7 Flash prompt optimizer</span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {usageSummary?.breakdown.aiRequests.used || 0} / {usageSummary?.breakdown.aiRequests.limit || 50} requests
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-white text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block">Developer API Endpoint Calls (/api/v1)</span>
                      <span className="text-neutral-500 text-[11px]">Programmatic execution with Bearer API keys</span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {usageSummary?.breakdown.apiRequests.used || 0} / {usageSummary?.breakdown.apiRequests.limit || 1000} requests
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-white text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block">Interactive Web Tool Executions</span>
                      <span className="text-neutral-500 text-[11px]">Local in-browser and server workstation executions</span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {usageSummary?.breakdown.toolExecutions.used || 0} / {usageSummary?.breakdown.toolExecutions.limit || 5000} runs
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => onNavigate('/docs')}>
                    <Code2 className="h-3.5 w-3.5 mr-1" />
                    Developer Documentation
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('/settings')}>
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Manage API Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 4: Workstation Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Quick Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 block">Full Account & Key Management</span>
                    <span className="text-neutral-500">Configure secret API keys, update passwords, and manage sessions.</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('/settings')}>
                    Open Settings View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
