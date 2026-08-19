import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ToolCard } from '../components/tools/ToolCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { FeatureCard } from '../components/ui/FeatureCard';
import { MetricCard } from '../components/ui/MetricCard';
import { BlogCard } from '../components/ui/BlogCard';
import { APP_CONFIG } from '../config/app.config';
import { db } from '../db/client';
import { executeTool } from '../services/toolService';
import { useToast } from '../components/ui/Toast';
import { copyToClipboard } from '../lib/utils';
import { SEOHead } from '../components/seo/SEOHead';
import { createOrganizationSchema, createWebSiteSchema } from '../lib/seo';
import {
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Terminal,
  Cpu,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Code2,
  Database,
  ShieldCheck,
  TrendingUp,
  FileCode,
  Copy,
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Server,
  Activity,
  Boxes,
  HelpCircle,
} from 'lucide-react';

export interface HomeViewProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenSearch }) => {
  const { showToast } = useToast();
  const metrics = db.getSystemMetrics();
  const categories = db.getCategories();
  const popularTools = db.getPopularTools();
  const blogPosts = db.getBlogPosts().slice(0, 3);

  // Live Interactive Hero Tool Preview State
  const [interactiveInput, setInteractiveInput] = useState<string>('{"service":"bygoodai","latency_ms":2.4,"processing":"client-side"}');
  const [interactiveOutput, setInteractiveOutput] = useState<string>('{\n  "latency_ms": 2.4,\n  "processing": "client-side",\n  "service": "bygoodai"\n}');
  const [interactiveSpeed, setInteractiveSpeed] = useState<number>(2.4);
  const [isRunningInteractive, setIsRunningInteractive] = useState<boolean>(false);
  const [copiedHero, setCopiedHero] = useState<boolean>(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleRunInteractive = async () => {
    setIsRunningInteractive(true);
    try {
      const res = await executeTool('json-formatter', interactiveInput, { indent: 2, sortKeys: true });
      if (res.success) {
        setInteractiveOutput(res.output);
        setInteractiveSpeed(res.executionTimeMs);
        showToast(`Formatted in ${res.executionTimeMs}ms (Client-Side)`, 'success');
      } else {
        showToast(res.error || 'Invalid JSON payload', 'error');
      }
    } catch {
      showToast('Parsing error. Check your JSON format.', 'error');
    } finally {
      setIsRunningInteractive(false);
    }
  };

  const handleCopyInteractive = async () => {
    if (!interactiveOutput) return;
    const success = await copyToClipboard(interactiveOutput);
    if (success) {
      setCopiedHero(true);
      showToast('Output copied to clipboard', 'success');
      setTimeout(() => setCopiedHero(false), 2000);
    }
  };

  const faqs = [
    {
      q: 'Does ByGoodAI transmit my data or JWT payloads to remote servers?',
      a: 'No. All formatters, cryptographic hash generators, regular expression testers, and Base64 converters execute completely in-memory within your browser using native JavaScript engines and the Web Crypto API. Your private credentials, API keys, and sensitive database objects never touch a remote storage disk.',
    },
    {
      q: 'How fast are the client-side tool transformations?',
      a: 'Because operations execute locally without network roundtrips, payloads are transformed and validated with sub-5 millisecond latency—even for large multiline JSON structures.',
    },
    {
      q: 'Can I integrate these utilities into automated CI/CD scripts or backend services?',
      a: 'Yes. ByGoodAI provides a standard REST API and lightweight TypeScript SDK for automated headless pipelines, serverless functions, and scheduled batch jobs.',
    },
    {
      q: 'Is there a keyboard shortcut system for fast navigation?',
      a: 'Yes! Press ⌘K on macOS or Ctrl+K on Windows/Linux from any screen to open the instant Command Palette. You can also press Ctrl+Enter / ⌘+Enter inside any tool workstation to execute immediately.',
    },
    {
      q: 'Are client utilities free for commercial and team use?',
      a: 'Yes. The Community Tier is 100% free with unlimited local executions for all engineering teams.',
    },
  ];

  return (
    <>
      <SEOHead
        title="ByGoodAI — AI Tools, Developer Tools & APIs"
        description="ByGoodAI provides fast, client-side developer utilities, security encoders, AI prompt optimizers, and automated APIs with sub-5ms in-memory processing and zero telemetry leaks."
        canonicalPath="/"
        jsonLd={[createOrganizationSchema(), createWebSiteSchema()]}
      />
      <PageContainer
        title="Production-Grade Developer Utilities & Workflow Suite"
        description={APP_CONFIG.description}
        onNavigate={onNavigate}
      >
        <div className="space-y-16 sm:space-y-24">
          {/* 1. HERO SECTION & QUICK LAUNCHER */}
          <section className="pt-6 sm:pt-12 pb-4 text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-xs font-semibold text-neutral-800 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ByGoodAI v{APP_CONFIG.version} Released</span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-500 font-mono">In-Memory Sandbox Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.12]">
              AI Tools, Developer Tools &amp; APIs. <br className="hidden sm:inline" />
              <span className="text-neutral-600">Sub-5ms Speed. Zero Telemetry.</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              The unified developer workstation to format JSON, test regex patterns, inspect JWT tokens, compute cryptographic hashes, beautify SQL, and optimize meta tags—at sub-5ms client speed.
            </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Terminal className="h-4 w-4" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => onNavigate('/tools')}
              className="w-full sm:w-auto"
            >
              Explore {metrics.totalTools} Developer Tools
            </Button>

            <Button
              variant="outline"
              size="lg"
              leftIcon={<Search className="h-4 w-4" />}
              onClick={onOpenSearch}
              className="w-full sm:w-auto font-mono text-xs"
            >
              Command Launcher (⌘K)
            </Button>
          </div>

          {/* 2. LIVE INTERACTIVE MINI-WORKSTATION RUNNER PREVIEW */}
          <div className="pt-8 max-w-3xl mx-auto text-left">
            <div className="rounded-2xl border border-neutral-300/80 bg-neutral-900 text-white shadow-xl overflow-hidden">
              {/* Window Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-neutral-700" />
                    <div className="h-3 w-3 rounded-full bg-neutral-700" />
                    <div className="h-3 w-3 rounded-full bg-neutral-700" />
                  </div>
                  <span className="font-mono text-neutral-400 text-[11px] ml-2">sandbox://json-formatter.live</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {interactiveSpeed}ms latency
                  </span>
                  <span className="text-neutral-500">100% in-browser</span>
                </div>
              </div>

              {/* Interactive Runner Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 p-4 gap-4">
                {/* Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>INPUT PAYLOAD</span>
                    <button
                      type="button"
                      onClick={() => setInteractiveInput('{"user_id":4021,"email":"dev@bygoodai.example","roles":["admin","maintainer"],"active":true}')}
                      className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    value={interactiveInput}
                    onChange={(e) => setInteractiveInput(e.target.value)}
                    rows={6}
                    className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-3 font-mono text-xs text-neutral-200 focus:border-neutral-600 focus:outline-none resize-none leading-relaxed"
                    placeholder="Enter JSON here..."
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 font-mono">{interactiveInput.length} bytes</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={isRunningInteractive}
                      leftIcon={<Play className="h-3.5 w-3.5 text-emerald-600" />}
                      onClick={handleRunInteractive}
                      className="h-7 text-xs bg-white text-neutral-900 hover:bg-neutral-200"
                    >
                      Format & Sort
                    </Button>
                  </div>
                </div>

                {/* Output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>FORMATTED OUTPUT</span>
                    <button
                      type="button"
                      onClick={handleCopyInteractive}
                      className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                    >
                      {copiedHero ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedHero ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={interactiveOutput}
                    rows={6}
                    className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Valid JSON (2 Spaces)</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('/tools/data/json-formatter')}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Workstation</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
            <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 text-center">
              <p className="text-lg font-bold text-neutral-900 font-mono">{metrics.totalTools}+</p>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Active Utilities</p>
            </div>
            <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 text-center">
              <p className="text-lg font-bold text-neutral-900 font-mono">~{metrics.averageLatencyMs}ms</p>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">In-Memory Latency</p>
            </div>
            <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 text-center">
              <p className="text-lg font-bold text-neutral-900 font-mono">100%</p>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Zero Data Logs</p>
            </div>
            <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 text-center">
              <p className="text-lg font-bold text-neutral-900 font-mono">{metrics.uptimePercentage}%</p>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Uptime Availability</p>
            </div>
          </div>
        </section>

        {/* 3. POPULAR TOOLS WORKSTATIONS */}
        <section className="space-y-6 border-t border-neutral-200/80 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <Badge variant="indigo" size="sm" className="mb-2">Frequently Used</Badge>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Popular Developer Tools
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Zero-setup utilities used daily for data formatting, regex debugging, and token inspection.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => onNavigate('/tools')}
              className="self-start sm:self-auto"
            >
              View Full Directory
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        {/* 4. CATEGORIES ECOSYSTEM */}
        <section className="space-y-6 border-t border-neutral-200/80 pt-12">
          <div>
            <Badge variant="secondary" size="sm" className="mb-2">Architecture Ecosystem</Badge>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Categorized Tooling Suites
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Organized suites tailored for backend engineers, frontend developers, devops, and security analysts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate(`/tools/${cat.slug}`)}
                className="p-5 rounded-xl border border-neutral-200/90 bg-white hover:border-neutral-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                      {cat.slug}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {cat.toolCount} tools
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-semibold text-neutral-800 group-hover:translate-x-1 transition-transform">
                  <span>Explore category</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WHY BYGOODAI (ZERO-TELEMETRY VS TRADITIONAL CLOUD) */}
        <section className="border-t border-neutral-200/80 pt-12">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-900 text-white p-8 sm:p-12">
            <div className="max-w-3xl space-y-6">
              <Badge variant="indigo" size="sm">Strict Security Model</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Why Engineers Choose In-Memory Client Isolation
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Traditional online utility websites send private tokens, JSON configuration payloads, and sensitive records across third-party cloud servers. ByGoodAI processes your transformations locally in your browser without transmitting sensitive payload inputs to external servers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-800 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Lock className="h-4 w-4" />
                    <span>Zero Data Logs</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Input payloads and token contents never touch external databases or remote disk storage.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <Zap className="h-4 w-4" />
                    <span>Sub-5ms Execution</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Zero network hops or DNS lookups. Computations run directly in your local browser runtime.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Code2 className="h-4 w-4" />
                    <span>Developer Ergonomics</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Built-in ⌘K Command Palette, Ctrl+Enter shortcuts, instant copy, and clean file exports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS PIPELINE */}
        <section className="space-y-8 border-t border-neutral-200/80 pt-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="secondary" size="sm">Execution Lifecycle</Badge>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">How the ByGoodAI Engine Works</h2>
            <p className="text-xs text-neutral-500">
              Three streamlined phases ensuring speed, strict validation, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-neutral-200/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 font-bold font-mono text-sm mb-4">
                01
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Input Ingestion & Sanitation</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Raw payloads are ingested directly into memory. Strict input validation and sanitization filters prevent execution exploits.
              </p>
            </Card>

            <Card className="p-6 border-neutral-200/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 font-bold font-mono text-sm mb-4">
                02
              </div>
              <h3 className="text-sm font-bold text-neutral-900">In-Memory Transformation</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                JavaScript V8 engine and Web Crypto APIs perform mathematical hashing, JSON schema parsing, regex evaluations, and conversions.
              </p>
            </Card>

            <Card className="p-6 border-neutral-200/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 font-bold font-mono text-sm mb-4">
                03
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Standardized Export & Copy</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Clean formatted results are rendered with precise microsecond execution metrics, instant clipboard copy, and file download support.
              </p>
            </Card>
          </div>
        </section>

        {/* 7. DEVELOPER WORKFLOWS & USE CASES */}
        <section className="space-y-8 border-t border-neutral-200/80 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <Badge variant="indigo" size="sm" className="mb-2">Everyday Workflows</Badge>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Engineered for High-Frequency Development
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Common scenarios where ByGoodAI eliminates context switching and saves engineering time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<Database className="h-5 w-5" />}
              title="API Debugging & JSON Sorting"
              description="Beautify unformatted API responses, sort nested object keys, and validate syntax errors instantly."
              badge="Data"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="JWT Token & Expiry Check"
              description="Inspect header and claims, decode base64 payloads, and verify expiration dates without leaking tokens."
              badge="Security"
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Regex Pattern Matching"
              description="Test multiline regular expressions against real log output with real-time match group highlighting."
              badge="Developer"
            />
            <FeatureCard
              icon={<Cpu className="h-5 w-5" />}
              title="Cryptographic Hashing"
              description="Generate SHA-256 and SHA-512 checksums and generate UUIDv4 identifiers for database seeding."
              badge="Security"
            />
          </div>
        </section>

        {/* 8. DOCUMENTATION & REST API TEASER */}
        <section className="space-y-6 border-t border-neutral-200/80 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="indigo" size="sm">Automated Workflows</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Automate Transformations with Our REST API & SDK
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Need to format JSON payloads or evaluate complex regex rules within your backend pipelines or CI/CD test runners? ByGoodAI provides standardized endpoints and a TypeScript SDK.
              </p>
              <div className="space-y-2 text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Standard OpenAPI JSON payload contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Lightweight `@bygoodai/sdk` npm package</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>High-performance serverless worker execution</span>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => onNavigate('/docs')}
                >
                  Read API Documentation
                </Button>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-2xl border border-neutral-300 bg-neutral-950 p-5 font-mono text-xs text-neutral-200 shadow-lg overflow-x-auto space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] text-neutral-400">
                <span>typescript-example.ts</span>
                <span className="text-emerald-400">REST v2.4</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-neutral-300">
                <span className="text-purple-400">import</span> &#123; ByGoodAI &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&apos;@bygoodai/sdk&apos;</span>;{'\n\n'}
                <span className="text-neutral-500">// Initialize client with zero overhead</span>{'\n'}
                <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-amber-300">ByGoodAI</span>(&#123; token: process.env.TOKEN &#125;);{'\n\n'}
                <span className="text-purple-400">const</span> &#123; output, executionTimeMs &#125; = <span className="text-purple-400">await</span> client.tools.<span className="text-blue-300">execute</span>(&#123;{'\n'}
                {'  '}toolSlug: <span className="text-emerald-300">&apos;json-formatter&apos;</span>,{'\n'}
                {'  '}input: rawPayload,{'\n'}
                {'  '}options: &#123; indent: <span className="text-amber-300">2</span>, sortKeys: <span className="text-amber-300">true</span> &#125;{'\n'}
                &#125;);{'\n\n'}
                console.<span className="text-blue-300">log</span>(<span className="text-emerald-300">&apos;Processed in:&apos;</span>, executionTimeMs, <span className="text-emerald-300">&apos;ms&apos;</span>);
              </pre>
            </div>
          </div>
        </section>

        {/* 9. ENGINEERING BLOG & RESOURCES */}
        <section className="space-y-6 border-t border-neutral-200/80 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <Badge variant="secondary" size="sm" className="mb-2">Engineering Guides</Badge>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Technical Articles & Deep-Dives
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Written by our core team on performance, regular expressions, and cryptography.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => onNavigate('/blog')}
            >
              All Articles
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        {/* 10. FREQUENTLY ASKED QUESTIONS */}
        <section className="space-y-6 border-t border-neutral-200/80 pt-12 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <Badge variant="indigo" size="sm">FAQ</Badge>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-neutral-500">
              Clear answers on architecture, privacy, execution speed, and developer access.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-200/90 bg-white transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 11. FINAL HIGH-CONVERSION CALL TO ACTION */}
        <section className="border-t border-neutral-200/80 pt-12">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 sm:p-12 text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Ready to Accelerate Your Daily Development?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Explore ByGoodAI for responsive, client-side code formatting and regex evaluations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Terminal className="h-4 w-4" />}
                onClick={() => onNavigate('/tools')}
              >
                Launch Developer Tools
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('/docs')}
              >
                Explore API Docs
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
    </>
  );
};
