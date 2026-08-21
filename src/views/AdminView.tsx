import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { SEOHead } from '../components/seo/SEOHead';
import { MetricCard } from '../components/ui/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { db } from '../db/client';
import { ShieldCheck, Activity, Server, Cpu, Database, RefreshCw, Terminal, Layers, PlayCircle, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { runAllToolTests, TestSuiteSummary } from '../services/toolTests';
import { runAuthDiagnostics, AuthTestSuiteSummary } from '../services/authTests';

export interface AdminViewProps {
  onNavigate: (path: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { isAdmin, isLoading } = useAuth();
  const metrics = db.getSystemMetrics();
  const tools = db.getTools();
  const history = db.getHistory();

  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  const [authSummary, setAuthSummary] = useState<AuthTestSuiteSummary | null>(null);
  const [isRunningAuthTests, setIsRunningAuthTests] = useState<boolean>(false);


  if (!isAdmin && !isLoading) {
    return (
      <>
        <SEOHead
          title="System Admin Telemetry | ByGoodAI"
          description="Access restricted to authorized workspace administrators."
          canonicalPath="/admin"
          robots="noindex,nofollow"
          isPrivate={true}
        />
        <PageContainer
          title="System Admin Telemetry"
          description="Access restricted to authorized workspace administrators."
          breadcrumbs={[{ label: 'System Admin', current: true }]}
          onNavigate={onNavigate}
        >
          <div className="max-w-md mx-auto my-12 text-center space-y-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900">Admin Access Required</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                This telemetry console is restricted to users with the <span className="font-semibold text-neutral-800">ADMIN</span> role.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => onNavigate('/')}>
                Return to Home
              </Button>
              <Button variant="primary" size="sm" onClick={() => onNavigate('/dashboard')}>
                Go to Workstation
              </Button>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }



  const handleRefresh = () => {
    showToast('Telemetry metrics refreshed', 'info');
  };

  const handleRunDiagnostics = async () => {
    setIsRunningTests(true);
    showToast('Running automated tool engine test suite...', 'info');
    try {
      const summary = await runAllToolTests();
      setTestSummary(summary);
      if (summary.failed === 0) {
        showToast(`All ${summary.totalTests} tests passed in ${summary.durationMs}ms`, 'success');
      } else {
        showToast(`${summary.failed} tests failed out of ${summary.totalTests}`, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Test suite failed', 'error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRunAuthDiagnostics = async () => {
    setIsRunningAuthTests(true);
    showToast('Running automated auth & security test suite...', 'info');
    try {
      const summary = await runAuthDiagnostics();
      setAuthSummary(summary);
      if (summary.failed === 0) {
        showToast(`All ${summary.totalTests} auth security tests passed!`, 'success');
      } else {
        showToast(`${summary.failed} auth tests failed out of ${summary.totalTests}`, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Auth test suite failed', 'error');
    } finally {
      setIsRunningAuthTests(false);
    }
  };

  return (
    <>
      <SEOHead
        title="System Telemetry & Engine Diagnostics | ByGoodAI"
        description="Real-time browser engine benchmarks and client sandbox isolation diagnostics."
        canonicalPath="/admin"
        robots="noindex,nofollow"
        isPrivate={true}
      />
      <PageContainer
        title="System Telemetry & Engine Diagnostics"
        description="Real-time browser engine benchmarks and client sandbox isolation diagnostics."
        breadcrumbs={[{ label: 'System Admin', current: true }]}
        onNavigate={onNavigate}
      >

      <div className="space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Engine Diagnostics & Benchmarks
              </h1>
              <Badge variant="success" size="sm">System Normal</Badge>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Browser V8 execution metrics, memory isolation health, and local performance benchmarks.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={handleRefresh}
          >
            Refresh Metrics
          </Button>
        </div>

        {/* Real vs Simulated Telemetry Notice */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs text-indigo-900 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Zero-Telemetry Privacy Guarantee</p>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              ByGoodAI maintains zero external server logging. The figures below represent local browser memory telemetry and synthetic baseline benchmarks.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Active Tools"
            value={metrics.totalTools}
            subtext="Available client utilities"
            icon={<Layers className="h-4 w-4" />}
          />
          <MetricCard
            label="Average Engine Latency"
            value={`${metrics.averageLatencyMs}ms`}
            subtext="In-memory V8 sandbox"
            trend="Sub-millisecond"
            trendPositive
            icon={<Cpu className="h-4 w-4" />}
          />
          <MetricCard
            label="Local Executions (Session)"
            value={history.length}
            subtext="Stored in browser localStorage"
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            label="Uptime Target"
            value={`${metrics.uptimePercentage}%`}
            subtext="Static bundle availability"
            icon={<Server className="h-4 w-4" />}
          />
        </div>

        {/* Automated Engine Test Suite */}
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-600" /> Automated Tool Engine Test Suite
              </h2>
              <p className="text-xs text-neutral-500">
                Execute automated unit tests, UTF-8 safety, ReDoS edge cases, and JSON/Regex assertions across all tools.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlayCircle className="h-4 w-4" />}
              onClick={handleRunDiagnostics}
              isLoading={isRunningTests}
            >
              Run All Tool Tests
            </Button>
          </div>

          {testSummary && (
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {testSummary.passed} Passed
                </span>
                {testSummary.failed > 0 && (
                  <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> {testSummary.failed} Failed
                  </span>
                )}
                <span className="text-neutral-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Total Time: {testSummary.durationMs}ms
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-neutral-200 divide-y divide-neutral-100 font-mono text-xs">
                {testSummary.results.map((res, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      {res.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      )}
                      <span className="font-bold text-neutral-800">{res.toolSlug}</span>
                      <span className="text-neutral-500 font-sans text-[11px]">— {res.testName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {res.error && <span className="text-red-600 font-sans text-[10px]">{res.error}</span>}
                      <span className="text-neutral-400 text-[10px]">{res.durationMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Automated Auth & Session Security Test Suite */}
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Authentication & Session Security Suite
              </h2>
              <p className="text-xs text-neutral-500">
                Verify registration, bcrypt salt work factor, cookie isolation, session lifecycle, password rotation, and safe user projection.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<PlayCircle className="h-4 w-4" />}
              onClick={handleRunAuthDiagnostics}
              isLoading={isRunningAuthTests}
            >
              Run Auth Tests
            </Button>
          </div>

          {authSummary && (
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {authSummary.passed} Passed
                </span>
                {authSummary.failed > 0 && (
                  <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> {authSummary.failed} Failed
                  </span>
                )}
                <span className="text-neutral-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Total Time: {authSummary.durationMs}ms
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-neutral-200 divide-y divide-neutral-100 font-mono text-xs">
                {authSummary.results.map((res, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      {res.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      )}
                      <span className="font-bold text-neutral-800">[{res.testId}]</span>
                      <span className="text-neutral-700 font-sans text-[11px]">{res.testName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {res.error && <span className="text-red-600 font-sans text-[10px]">{res.error}</span>}
                      <span className="text-neutral-400 text-[10px]">{res.durationMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tool Benchmarks Table */}

        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Per-Tool Execution Benchmarks</h2>
          <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 font-mono text-neutral-600">
                  <th className="p-3.5 pl-5">Utility</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Target Latency</th>
                  <th className="p-3.5">Isolation Level</th>
                  <th className="p-3.5 text-right pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono text-neutral-700">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-neutral-50/50">
                    <td className="p-3.5 pl-5 font-sans font-semibold text-neutral-900">{tool.name}</td>
                    <td className="p-3.5 uppercase text-[10px] text-neutral-500 font-sans">{tool.category}</td>
                    <td className="p-3.5 text-emerald-600">~{tool.averageExecutionMs}ms</td>
                    <td className="p-3.5 font-sans text-neutral-600">In-Memory V8</td>
                    <td className="p-3.5 text-right pr-5">
                      <Badge variant="success" size="sm">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
    </>
  );
};
