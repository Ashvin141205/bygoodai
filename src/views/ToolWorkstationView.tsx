import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ToolCard } from '../components/tools/ToolCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { useToast } from '../components/ui/Toast';
import { db } from '../db/client';
import { getToolBySlug, getRelatedTools } from '../services/toolRegistry';
import { executeTool } from '../services/toolExecutor';
import { copyToClipboard, downloadFile, formatBytes } from '../lib/utils';
import { ToolExecutionResult, ToolOptionDefinition } from '../types/toolEngine';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { createToolSchema, createFAQSchema } from '../lib/seo';
import {
  Play,
  Copy,
  Check,
  Download,
  Trash2,
  Bookmark,
  Share2,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Lock,
  Terminal,
  FileCode,
  ArrowRight,
  Code2,
  HelpCircle,
  Clock,
  RotateCcw,
  Sliders,
  Settings2,
  Upload,
  ShieldCheck,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';

export interface ToolWorkstationViewProps {
  toolSlug: string;
  onNavigate: (path: string) => void;
}

export const ToolWorkstationView: React.FC<ToolWorkstationViewProps> = ({
  toolSlug,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const tool = getToolBySlug(toolSlug);

  // Workstation state
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ToolExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'preview' | 'meta' | 'history'>('formatted');
  const [activeCodeLang, setActiveCodeLang] = useState<'ts' | 'py' | 'curl'>('ts');

  // Dynamic Options State
  const [options, setOptions] = useState<Record<string, any>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputEditorRef = useRef<HTMLTextAreaElement>(null);

  // Initialize tool defaults
  useEffect(() => {
    if (tool) {
      setInput(tool.sampleInput || '');
      setOutput('');
      setExecutionResult(null);
      setError(null);
      setErrorDetails(null);
      setIsSaved(db.isToolSaved(tool.slug));

      // Build default options map
      const initialOptions: Record<string, any> = {};
      tool.options.forEach((opt) => {
        initialOptions[opt.id] = opt.defaultValue;
      });
      setOptions(initialOptions);
      setActiveTab('formatted');
    }
  }, [toolSlug, tool]);

  // Related Tools
  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return getRelatedTools(tool.slug, 3);
  }, [tool]);

  // Tool History
  const toolHistory = useMemo(() => {
    if (!tool) return [];
    return db.getHistory().filter((h) => h.toolSlug === tool.slug).slice(0, 10);
  }, [tool, executionResult]);

  if (!tool) {
    return (
      <PageContainer
        title="Tool Not Found"
        description="The requested developer utility was not found."
        onNavigate={onNavigate}
      >
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Developer Tool Not Found</h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            The tool slug &quot;{toolSlug}&quot; is not registered in the ByGoodAI Tool Registry.
          </p>
          <Button variant="primary" onClick={() => onNavigate('/tools')}>
            Return to Tool Directory
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Handle Tool Execution
  const handleExecute = async () => {
    if (!input.trim() && tool.inputType !== 'color') {
      setError('Please provide an input payload to execute this tool.');
      setErrorDetails('The workstation requires non-empty content to process.');
      setOutput('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const result = await executeTool({
        toolSlug: tool.slug,
        input,
        options,
        context: { isBrowser: true },
      });

      setExecutionResult(result);

      if (result.success) {
        setOutput(result.output);
        showToast(`Processed in ${result.executionTimeMs}ms`, 'success');
      } else {
        setError(result.error || 'Execution encountered a syntax or validation failure.');
        setErrorDetails(result.details || null);
        setOutput('');
        showToast(result.error || 'Execution failed', 'error');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected execution error occurred.');
      setErrorDetails(err.stack || null);
      setOutput('');
      showToast('Execution error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleCopyOutput = async () => {
    if (!output) return;
    const success = await copyToClipboard(output);
    if (success) {
      setIsCopied(true);
      showToast('Output copied to clipboard', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadOutput = () => {
    if (!output) return;
    const ext = tool.defaultExportExtension || 'txt';
    const mime = tool.mimeType || 'text/plain';
    downloadFile(output, `${tool.slug}-output.${ext}`, mime);
    showToast(`Downloaded ${tool.slug}-output.${ext}`, 'info');
  };

  const handleBookmarkToggle = () => {
    const saved = db.toggleSaveItem(tool.id, tool.slug, tool.name);
    setIsSaved(saved);
    showToast(saved ? 'Added tool to bookmarks' : 'Removed tool from bookmarks', 'info');
  };

  const handleShare = async () => {
    const url = window.location.href;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Tool link copied to clipboard', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInput(text);
        showToast(`Loaded ${file.name} (${formatBytes(file.size)})`, 'success');
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    setInput(tool.sampleInput);
    setError(null);
    setErrorDetails(null);
    showToast('Loaded sample payload', 'info');
  };

  const handleClearAll = () => {
    setInput('');
    setOutput('');
    setExecutionResult(null);
    setError(null);
    setErrorDetails(null);
    showToast('Canvas cleared', 'info');
  };

  const handleOptionChange = (optionId: string, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const handleRestoreHistory = (historyItem: any) => {
    if (historyItem.inputPayload) {
      setInput(historyItem.inputPayload);
      showToast('Restored historical input payload', 'info');
    }
  };

  // Code integration snippet generator
  const getIntegrationSnippet = () => {
    const jsonOptions = JSON.stringify(options);
    if (activeCodeLang === 'ts') {
      return `// TypeScript / Node.js
import { executeTool } from '@bygoodai/sdk';

async function run() {
  const result = await executeTool({
    toolSlug: '${tool.slug}',
    input: ${JSON.stringify(input.slice(0, 80))}...,
    options: ${jsonOptions}
  });

  if (result.success) {
    console.log('Result:', result.output);
  }
}
run();`;
    } else if (activeCodeLang === 'py') {
      return `# Python 3
import requests

response = requests.post(
    "https://api.bygoodai.example/v1/tools/execute",
    json={
        "tool_slug": "${tool.slug}",
        "input": ${JSON.stringify(input.slice(0, 80))}...,
        "options": ${jsonOptions}
    }
)
data = response.json()
print("Result:", data.get("output"))`;
    } else {
      return `# cURL Request
curl -X POST https://api.bygoodai.example/v1/tools/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "toolSlug": "${tool.slug}",
    "input": ${JSON.stringify(input.slice(0, 80))}...,
    "options": ${jsonOptions}
  }'`;
    }
  };

  if (!tool) {
    return (
      <>
        <SEOHead
          title="Tool Not Found | ByGoodAI"
          description="The requested developer tool was not found on ByGoodAI."
          isPrivate={true}
        />
        <PageContainer
          title="Tool Not Found"
          description="The requested developer tool does not exist."
          onNavigate={onNavigate}
        >
          <div className="text-center py-16 space-y-4">
            <h1 className="text-2xl font-bold text-neutral-800">Tool Not Found</h1>
            <p className="text-sm text-neutral-500">We could not locate the utility "{toolSlug}".</p>
            <Button variant="primary" onClick={() => onNavigate('/tools')}>
              Browse All Tools
            </Button>
          </div>
        </PageContainer>
      </>
    );
  }

  const breadcrumbItems = [
    { name: 'Tools', url: '/tools' },
    { name: tool.category, url: `/tools/${tool.category}` },
    { name: tool.name, url: `/tools/${tool.category}/${tool.slug}` },
  ];

  return (
    <>
      <SEOHead
        title={`${tool.name} — Free Online Developer Tool | ByGoodAI`}
        description={`${tool.description} Fast, secure in-browser ${tool.name} with sub-5ms processing and zero data retention.`}
        canonicalPath={`/tools/${tool.category}/${tool.slug}`}
        jsonLd={[
          createToolSchema(tool),
          createFAQSchema(tool.documentation?.faq || []),
        ]}
        breadcrumbs={breadcrumbItems}
      />
      <PageContainer
        title={`${tool.name} — ByGoodAI Workstation`}
        description={tool.description}
        breadcrumbs={[
          { label: 'Tools', onClick: () => onNavigate('/tools') },
          { label: tool.category.toUpperCase(), onClick: () => onNavigate(`/tools/${tool.category}`) },
          { label: tool.name, current: true },
        ]}
        onNavigate={onNavigate}
      >
        <div className="space-y-8">
          {/* Visible Semantic Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />

          {/* Workstation Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
                  {tool.name}
                </h1>
                <Badge variant="indigo" size="sm">
                  {tool.category}
                </Badge>
                <Badge variant="success" size="sm">
                  In-Memory Client Engine
                </Badge>
                {tool.isPopular && <Badge variant="default" size="sm">Popular</Badge>}
              {tool.isNew && <Badge variant="emerald" size="sm">New</Badge>}
            </div>
            <p className="text-xs text-neutral-500 max-w-2xl">{tool.description}</p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current text-amber-500' : ''}`} />}
              onClick={handleBookmarkToggle}
            >
              {isSaved ? 'Saved' : 'Bookmark'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="h-3.5 w-3.5" />}
              onClick={handleShare}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="h-8 w-8"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* WORKSTATION DUAL-PANE WORKSPACE */}
        <div
          className={`space-y-4 ${
            isFullscreen
              ? 'fixed inset-0 z-50 bg-neutral-950 p-6 overflow-y-auto'
              : ''
          }`}
        >
          {/* Dynamic Tool Options Configuration Ribbon */}
          {tool.options && tool.options.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/90 p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5 shrink-0">
                  <Sliders className="h-3.5 w-3.5 text-indigo-600" /> Options:
                </span>

                {tool.options.map((opt: ToolOptionDefinition) => {
                  if (opt.type === 'select') {
                    return (
                      <div key={opt.id} className="flex items-center gap-1.5">
                        <span className="text-neutral-500 font-medium">{opt.label}:</span>
                        <select
                          value={options[opt.id] ?? opt.defaultValue}
                          onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                        >
                          {opt.options?.map((choice) => (
                            <option key={String(choice.value)} value={choice.value}>
                              {choice.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (opt.type === 'checkbox' || opt.type === 'toggle') {
                    return (
                      <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer text-neutral-700 font-medium select-none hover:text-neutral-900">
                        <input
                          type="checkbox"
                          checked={Boolean(options[opt.id] ?? opt.defaultValue)}
                          onChange={(e) => handleOptionChange(opt.id, e.target.checked)}
                          className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  }

                  if (opt.type === 'text') {
                    return (
                      <div key={opt.id} className="flex items-center gap-1.5">
                        <span className="text-neutral-500 font-medium">{opt.label}:</span>
                        <input
                          type="text"
                          value={options[opt.id] ?? opt.defaultValue ?? ''}
                          placeholder={opt.placeholder}
                          onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 min-w-[140px]"
                        />
                      </div>
                    );
                  }

                  if (opt.type === 'number') {
                    return (
                      <div key={opt.id} className="flex items-center gap-1.5">
                        <span className="text-neutral-500 font-medium">{opt.label}:</span>
                        <input
                          type="number"
                          value={options[opt.id] ?? opt.defaultValue ?? 1}
                          min={opt.validation?.min}
                          max={opt.validation?.max}
                          onChange={(e) => handleOptionChange(opt.id, Number(e.target.value))}
                          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 w-20 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{tool.privacyText || 'Processed 100% locally in browser memory.'}</span>
              </div>
            </div>
          )}

          {/* DUAL PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* LEFT: INPUT CANVAS */}
            <Card className="flex flex-col border border-neutral-200 shadow-xs overflow-hidden">
              <CardHeader className="bg-neutral-50/90 px-4 py-2.5 border-b border-neutral-200/80 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                  <CardTitle className="text-xs font-bold text-neutral-800">
                    Input Canvas ({tool.inputType.toUpperCase()})
                  </CardTitle>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-neutral-600"
                    leftIcon={<Upload className="h-3 w-3" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload File
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-neutral-600"
                    leftIcon={<RotateCcw className="h-3 w-3" />}
                    onClick={handleLoadSample}
                  >
                    Load Sample
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-neutral-600 hover:text-red-600"
                    leftIcon={<Trash2 className="h-3 w-3" />}
                    onClick={handleClearAll}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col bg-white">
                <textarea
                  ref={inputEditorRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={tool.inputPlaceholder || 'Type or paste input payload here...'}
                  rows={14}
                  className="w-full flex-1 p-4 font-mono text-xs text-neutral-900 bg-white border-0 resize-none focus:outline-hidden focus:ring-0 leading-relaxed"
                  spellCheck={false}
                />

                <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between text-[11px] text-neutral-500">
                  <div className="flex items-center gap-3">
                    <span>{input.length} characters</span>
                    <span>{input.split(/\s+/).filter(Boolean).length} words</span>
                    <span>{formatBytes(new TextEncoder().encode(input).byteLength)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-neutral-400">Execute:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/80 text-[10px] font-mono text-neutral-700">
                      Ctrl + Enter
                    </kbd>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RIGHT: OUTPUT WORKSPACE */}
            <Card className="flex flex-col border border-neutral-200 shadow-xs overflow-hidden bg-white">
              <CardHeader className="bg-neutral-50/90 px-4 py-2 border-b border-neutral-200/80 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-indigo-600" />
                  <CardTitle className="text-xs font-bold text-neutral-800">
                    Output Result ({tool.outputType.toUpperCase()})
                  </CardTitle>
                </div>

                <div className="flex items-center gap-1.5">
                  {executionResult?.customView && (
                    <div className="flex items-center rounded-md bg-neutral-200/70 p-0.5 text-[11px]">
                      <button
                        onClick={() => setActiveTab('formatted')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                          activeTab === 'formatted'
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        Code
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                          activeTab === 'preview'
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <Eye className="h-2.5 w-2.5" /> Preview
                      </button>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-neutral-600"
                    leftIcon={isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    onClick={handleCopyOutput}
                    disabled={!output}
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-neutral-600"
                    leftIcon={<Download className="h-3 w-3" />}
                    onClick={handleDownloadOutput}
                    disabled={!output}
                  >
                    Export
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col relative bg-neutral-900 text-neutral-100">
                {/* Error Banner */}
                {error && (
                  <div className="p-4 bg-red-950/80 border-b border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">{error}</div>
                      {errorDetails && <div className="text-[11px] text-red-300/90 font-mono">{errorDetails}</div>}
                    </div>
                  </div>
                )}

                {/* Warnings Banner */}
                {executionResult?.warnings && executionResult.warnings.length > 0 && (
                  <div className="p-2.5 bg-amber-950/80 border-b border-amber-800/80 text-amber-200 text-[11px] flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>{executionResult.warnings.join(' ')}</span>
                  </div>
                )}

                {/* Main Output Renderer */}
                <div className="flex-1 p-4 font-mono text-xs overflow-auto max-h-[380px] leading-relaxed select-text">
                  {activeTab === 'preview' && executionResult?.customView ? (
                    <div className="font-sans text-neutral-900 bg-white p-4 rounded-lg">
                      {/* Markdown & HTML Live Preview */}
                      {executionResult.customView === 'html' && (
                        <div
                          className="prose prose-sm max-w-none text-neutral-900"
                          dangerouslySetInnerHTML={{ __html: executionResult.customData?.sanitizedHtml || output }}
                        />
                      )}

                      {/* Color Palette Harmonizer Preview */}
                      {executionResult.customView === 'color' && executionResult.customData && (
                        <div className="space-y-4">
                          <div className="font-bold text-sm text-neutral-900 flex items-center justify-between border-b pb-2">
                            <span>Base Color: {executionResult.customData.baseColor}</span>
                            <span className="text-xs text-neutral-500">WCAG 2.2 AA Contrast: {executionResult.customData.wcagCompliance?.wcag22AA_NormalText}</span>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-neutral-700 mb-2">Tailwind 50-950 Scale</div>
                            <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
                              {executionResult.customData.shadesDetailed?.map((s: any) => (
                                <div key={s.step} className="flex flex-col items-center gap-1">
                                  <div
                                    className="w-full h-9 rounded-md border border-black/10 shadow-xs flex items-center justify-center text-[9px] font-bold"
                                    style={{ backgroundColor: s.hex, color: s.contrastOnWhite > s.contrastOnBlack ? '#fff' : '#000' }}
                                  >
                                    {s.step}
                                  </div>
                                  <span className="text-[9px] text-neutral-500 font-mono">{s.hex}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <div className="text-xs font-semibold text-neutral-700 mb-2">Color Harmonies</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(executionResult.customData.harmonies || {}).map(([name, val]: [string, any]) => (
                                <div key={name} className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200">
                                  <div className="w-6 h-6 rounded border border-black/10 shrink-0" style={{ backgroundColor: val.hex }} />
                                  <div className="truncate">
                                    <div className="text-[10px] font-bold text-neutral-700 capitalize">{name}</div>
                                    <div className="text-[9px] text-neutral-500 font-mono">{val.hex}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Meta Tags Preview Card */}
                      {executionResult.customView === 'meta' && executionResult.customData && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-neutral-700">Social Share Card Preview</div>
                          <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden max-w-md shadow-xs">
                            <div className="h-36 bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
                              {executionResult.customData.image ? (
                                <img src={executionResult.customData.image} alt="OG Banner" className="w-full h-full object-cover" />
                              ) : (
                                'OpenGraph Banner Preview'
                              )}
                            </div>
                            <div className="p-3 space-y-1">
                              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">{executionResult.customData.url}</div>
                              <div className="text-xs font-bold text-neutral-900 leading-snug">{executionResult.customData.title}</div>
                              <div className="text-[11px] text-neutral-600 line-clamp-2">{executionResult.customData.description}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Unit Converter Table */}
                      {executionResult.customView === 'unit' && executionResult.customData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {Object.entries(executionResult.customData).map(([k, v]) => (
                            <div key={k} className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
                              <span className="text-neutral-500 font-medium">{k}:</span>
                              <span className="font-mono font-bold text-neutral-900">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : output ? (
                    <pre className="whitespace-pre-wrap font-mono text-neutral-200 text-xs leading-relaxed">
                      {output}
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 py-16 space-y-2 text-center">
                      <Sparkles className="h-6 w-6 text-neutral-600" />
                      <p className="text-xs">Execution results and transformed payloads will appear here.</p>
                      <p className="text-[11px] text-neutral-600">Click &quot;Execute Tool&quot; or press Ctrl+Enter.</p>
                    </div>
                  )}
                </div>

                {/* Output Metrics Footer */}
                <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-400">
                  <div className="flex items-center gap-3">
                    {executionResult && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {executionResult.executionTimeMs}ms
                      </span>
                    )}
                    <span>{output.length} characters</span>
                    <span>{formatBytes(new TextEncoder().encode(output).byteLength)}</span>
                  </div>

                  {executionResult?.metadata && (
                    <div className="flex items-center gap-2 text-neutral-400 text-[10px]">
                      {Object.entries(executionResult.metadata).slice(0, 2).map(([k, v]) => (
                        <span key={k} className="bg-neutral-800 px-1.5 py-0.5 rounded">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Action Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Zero-Storage Guarantee: Payloads reside solely in temporary client RAM during execution.</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
              leftIcon={<Play className="h-4 w-4 fill-current" />}
              onClick={handleExecute}
              isLoading={isLoading}
            >
              Execute {tool.name.split(' ')[0]}
            </Button>
          </div>
        </div>

        {/* WORKSTATION TABS: DOCUMENTATION, INTEGRATION CODE & HISTORY */}
        <div className="space-y-4 pt-4 border-t border-neutral-200">
          <Tabs
            tabs={[
              {
                id: 'docs',
                label: 'Documentation & Guide',
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="md:col-span-2 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-neutral-900">Overview</h3>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {tool.documentation.overview}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-neutral-900">How to Use</h3>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-600">
                          {tool.documentation.howToUse.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-neutral-900">Key Features</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                          {tool.documentation.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {tool.documentation.faq && tool.documentation.faq.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h3 className="text-sm font-bold text-neutral-900">Frequently Asked Questions</h3>
                          <div className="space-y-3">
                            {tool.documentation.faq.map((item, idx) => (
                              <div key={idx} className="rounded-lg border border-neutral-200 p-3 bg-neutral-50/50 space-y-1">
                                <div className="font-semibold text-xs text-neutral-900">{item.question}</div>
                                <div className="text-[11px] text-neutral-600 leading-relaxed">{item.answer}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Limits Panel */}
                    <div className="space-y-4">
                      <Card className="border border-neutral-200 shadow-xs">
                        <CardHeader className="py-3 px-4 bg-neutral-50/80 border-b">
                          <CardTitle className="text-xs font-bold text-neutral-800">Tool Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 text-xs">
                          <div className="flex justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-500">Category:</span>
                            <span className="font-medium text-neutral-800 capitalize">{tool.category}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-500">Difficulty:</span>
                            <span className="font-medium text-neutral-800 capitalize">{tool.difficulty}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-500">Input Type:</span>
                            <span className="font-mono text-neutral-800">{tool.inputType}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-500">Max Payload:</span>
                            <span className="font-medium text-neutral-800">
                              {tool.limits?.maxInputLength ? formatBytes(tool.limits.maxInputLength) : '5.0 MB'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-neutral-500">Avg Latency:</span>
                            <span className="font-medium text-emerald-600">{tool.averageExecutionMs}ms</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ),
              },
              {
                id: 'code',
                label: 'API & SDK Integration',
                content: (
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={activeCodeLang === 'ts' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setActiveCodeLang('ts')}
                        >
                          TypeScript
                        </Button>
                        <Button
                          variant={activeCodeLang === 'py' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setActiveCodeLang('py')}
                        >
                          Python
                        </Button>
                        <Button
                          variant={activeCodeLang === 'curl' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setActiveCodeLang('curl')}
                        >
                          cURL
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Copy className="h-3 w-3" />}
                        onClick={async () => {
                          await copyToClipboard(getIntegrationSnippet());
                          showToast('Code snippet copied', 'success');
                        }}
                      >
                        Copy Snippet
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                      <pre>{getIntegrationSnippet()}</pre>
                    </div>
                  </div>
                ),
              },
              {
                id: 'history',
                label: `Execution History (${toolHistory.length})`,
                content: (
                  <div className="pt-4 space-y-3">
                    {toolHistory.length === 0 ? (
                      <div className="text-center py-8 text-neutral-400 text-xs">
                        No previous executions recorded for this tool in this browser session.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {toolHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Badge variant={item.isSuccess ? 'success' : 'error'} size="sm">
                                  {item.isSuccess ? 'SUCCESS' : 'ERROR'}
                                </Badge>
                                <span className="font-mono text-neutral-700">{item.executionTimeMs}ms</span>
                                <span className="text-[11px] text-neutral-400">
                                  {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 font-mono truncate max-w-md">
                                {item.inputSnippet || 'No snippet preview'}
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestoreHistory(item)}
                            >
                              Restore Input
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* RELATED TOOLS SECTION */}
        {relatedTools.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Related Developer Utilities</h2>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="h-3 w-3" />}
                onClick={() => onNavigate(`/tools/${tool.category}`)}
              >
                View all in {tool.category}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((relTool) => (
                <ToolCard
                  key={relTool.id}
                  tool={{
                    id: relTool.id,
                    slug: relTool.slug,
                    name: relTool.name,
                    description: relTool.description,
                    category: relTool.category,
                    icon: relTool.icon,
                    tags: relTool.tags,
                    usageCount: relTool.usageCount,
                    rating: relTool.rating,
                    averageExecutionMs: relTool.averageExecutionMs,
                    isPopular: relTool.isPopular,
                    isNew: relTool.isNew,
                    isPro: relTool.isPro,
                  }}
                  onSelect={(selectedSlug) => onNavigate(`/tools/${selectedSlug}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
    </>
  );
};
