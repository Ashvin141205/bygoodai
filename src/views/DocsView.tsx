import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { copyToClipboard } from '../lib/utils';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import {
  Terminal,
  Copy,
  Check,
  Server,
  Key,
  Sparkles,
  Zap,
  Lock,
  BarChart3,
} from 'lucide-react';

export interface DocsViewProps {
  onNavigate: (path: string) => void;
}

export const DocsView: React.FC<DocsViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('quickstart');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyCode = async (code: string, id: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedKey(id);
      showToast('Code snippet copied to clipboard', 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const menuItems = [
    { id: 'quickstart', label: '1. Quickstart & Authentication', icon: <Key className="h-3.5 w-3.5" /> },
    { id: 'tools-api', label: '2. Tools Execution API (/v1/tools)', icon: <Server className="h-3.5 w-3.5" /> },
    { id: 'ai-api', label: '3. Gemini AI API (/v1/ai)', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'usage-api', label: '4. Usage & Quota API (/usage)', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'limits', label: '5. Rate Limits & Quotas', icon: <Zap className="h-3.5 w-3.5" /> },
    { id: 'errors', label: '6. Error Codes & Diagnostics', icon: <Terminal className="h-3.5 w-3.5" /> },
  ];

  const breadcrumbItems = [{ name: 'Documentation', url: '/docs' }];

  return (
    <>
      <SEOHead
        title="Developer API & SDK Documentation | ByGoodAI"
        description="Complete REST API documentation and code snippets to execute ByGoodAI developer tools, formatters, and AI prompt engineering programmatically."
        canonicalPath="/docs"
        breadcrumbs={breadcrumbItems}
      />
      <PageContainer
        title="Developer API & Integration Reference"
        description="Integrate ByGoodAI developer tools, prompt optimizers, and formatters directly into your code, CLI, or CI/CD pipelines."
        breadcrumbs={[{ label: 'Documentation', current: true }]}
        onNavigate={onNavigate}
      >
        <div className="space-y-8">
          {/* Visible Semantic Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />

          {/* Header Title */}
          <div className="border-b border-neutral-200/80 pb-5 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm">Developer API v1 (Beta)</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            ByGoodAI Developer API Reference
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Headless execution endpoints for JSON formatters, regular expressions, cryptographic hashes, and Gemini prompt optimization.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-1 bg-neutral-50 p-2 rounded-xl border border-neutral-200/80 sticky top-20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1.5 block">
              Documentation Index
            </span>
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <div className="pt-3 border-t border-neutral-200 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-center"
                onClick={() => onNavigate('/settings')}
              >
                <Key className="h-3 w-3 mr-1" />
                Manage API Keys
              </Button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* Section 1: Quickstart & Authentication */}
            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">1. Quickstart & Authentication</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-1">
                    All Developer API requests must be authenticated using a secret Bearer API key in the standard HTTP <code className="font-mono text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">Authorization</code> header.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    <span>Authentication Header Format</span>
                  </div>
                  <div className="bg-neutral-900 text-neutral-200 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    Authorization: Bearer osk_live_xxxxxxxxxxxxxxxxxxxxxxxx
                  </div>
                  <p className="text-neutral-500 text-[11px]">
                    Alternative header <code className="font-mono text-neutral-800">x-api-key: osk_live_...</code> is also accepted. Replace <code className="font-mono text-neutral-800">https://api.example.com</code> with your application base URL or <code className="font-mono text-neutral-800">http://localhost:3000</code> during local development.
                  </p>
                </div>

                {/* cURL Example */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-bold text-neutral-700">Quickstart: cURL Request</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCode(
                          `curl -X POST https://api.example.com/api/v1/tools/json-formatter \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"input": "{\\"project\\":\\"ByGoodAI\\",\\"ready\\":true}", "options": {"indent": 2, "sortKeys": true}}'`,
                          'curl-quick'
                        )
                      }
                      className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-mono text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'curl-quick' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>Copy cURL</span>
                    </button>
                  </div>
                  <div className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-neutral-200 overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed">
{`curl -X POST https://api.example.com/api/v1/tools/json-formatter \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "{\\"project\\":\\"ByGoodAI\\",\\"ready\\":true}", "options": {"indent": 2, "sortKeys": true}}'`}
                    </pre>
                  </div>
                </div>

                {/* TypeScript Example */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-bold text-neutral-700">TypeScript / Fetch Integration</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCode(
                          `async function formatJson(rawJson: string, apiKey: string) {\n  const response = await fetch('https://api.example.com/api/v1/tools/json-formatter', {\n    method: 'POST',\n    headers: {\n      'Authorization': \`Bearer \${apiKey}\`,\n      'Content-Type': 'application/json',\n    },\n    body: JSON.stringify({\n      input: rawJson,\n      options: { indent: 2, sortKeys: true },\n    }),\n  });\n  const { data } = await response.json();\n  return data.output;\n}`,
                          'ts-quick'
                        )
                      }
                      className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-mono text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'ts-quick' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>Copy TS</span>
                    </button>
                  </div>
                  <div className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-neutral-200 overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed">
{`async function formatJson(rawJson: string, apiKey: string) {
  const response = await fetch('https://api.example.com/api/v1/tools/json-formatter', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: rawJson,
      options: { indent: 2, sortKeys: true },
    }),
  });

  const { data } = await response.json();
  return data.output;
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Tools API */}
            {activeSection === 'tools-api' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">2. Tools Execution API</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-1">
                    Execute formatters, analyzers, decoders, and validators programmatically with deterministic sub-millisecond execution.
                  </p>
                </div>

                {/* GET /api/v1/tools */}
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs font-semibold text-neutral-900">/api/v1/tools</span>
                    </div>
                    <span className="text-[11px] text-neutral-500">Public Discovery</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <p className="text-neutral-600">Lists all registered tools, their categories, supported options, and execution limits.</p>
                  </div>
                </div>

                {/* POST /api/v1/tools/:slug */}
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">POST</span>
                      <span className="font-mono text-xs font-semibold text-neutral-900">/api/v1/tools/:slug</span>
                    </div>
                    <span className="text-[11px] text-neutral-500">Requires Bearer API Key</span>
                  </div>
                  <div className="p-4 space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block mb-1">Supported Tool Slugs</span>
                      <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                        {[
                          'json-formatter',
                          'regex-tester',
                          'sql-formatter',
                          'markdown-html',
                          'html-formatter',
                          'css-formatter',
                          'case-converter',
                          'slug-generator',
                          'jwt-decoder',
                          'base64-converter',
                          'hash-generator',
                          'uuid-generator',
                          'html-entities',
                          'unit-converter',
                          'timestamp-converter',
                          'url-parser',
                          'url-encoder',
                          'word-counter',
                          'number-base',
                          'json-csv',
                          'color-palette',
                          'meta-tags',
                        ].map((slug) => (
                          <span key={slug} className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                            {slug}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-neutral-900 block mb-1">Response Schema (200 OK)</span>
                      <div className="rounded-lg bg-neutral-950 p-3 font-mono text-[11px] text-neutral-200">
{`{
  "success": true,
  "data": {
    "tool": {
      "slug": "json-formatter",
      "name": "JSON Formatter & Validator",
      "category": "data"
    },
    "output": "{\\n  \\"project\\": \\"ByGoodAI\\"\\n}",
    "metadata": { ... },
    "byteSize": {
      "input": 32,
      "output": 36
    }
  },
  "executionTimeMs": 2.4
}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: AI API */}
            {activeSection === 'ai-api' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">3. Gemini AI Prompt Optimization API</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-1">
                    Transform raw prompts into production-grade, hallucination-resistant LLM system blueprints powered by Google Gemini 3.7 Flash.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">POST</span>
                      <span className="font-mono text-xs font-semibold text-neutral-900">/api/v1/ai/prompt-optimize</span>
                    </div>
                    <span className="text-[11px] text-neutral-500">Requires Bearer API Key</span>
                  </div>
                  <div className="p-4 space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block mb-1">Request Parameters (JSON)</span>
                      <div className="rounded-lg border border-neutral-200 overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-neutral-50 border-b border-neutral-200 font-mono text-neutral-600 text-[11px]">
                            <tr>
                              <th className="p-2.5">Field</th>
                              <th className="p-2.5">Type</th>
                              <th className="p-2.5">Default</th>
                              <th className="p-2.5">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                            <tr>
                              <td className="p-2.5 font-bold">prompt</td>
                              <td className="p-2.5 text-neutral-500">string</td>
                              <td className="p-2.5 text-neutral-400">required</td>
                              <td className="p-2.5 font-sans">Raw prompt or instruction text to optimize</td>
                            </tr>
                            <tr>
                              <td className="p-2.5">targetModel</td>
                              <td className="p-2.5 text-neutral-500">enum</td>
                              <td className="p-2.5 text-neutral-600">&quot;gemini&quot;</td>
                              <td className="p-2.5 font-sans">&quot;gemini&quot; | &quot;claude&quot; | &quot;gpt&quot; | &quot;generic&quot;</td>
                            </tr>
                            <tr>
                              <td className="p-2.5">style</td>
                              <td className="p-2.5 text-neutral-500">enum</td>
                              <td className="p-2.5 text-neutral-600">&quot;structured&quot;</td>
                              <td className="p-2.5 font-sans">&quot;structured&quot; | &quot;concise&quot; | &quot;detailed&quot; | &quot;code-focused&quot;</td>
                            </tr>
                            <tr>
                              <td className="p-2.5">detailLevel</td>
                              <td className="p-2.5 text-neutral-500">enum</td>
                              <td className="p-2.5 text-neutral-600">&quot;expert&quot;</td>
                              <td className="p-2.5 font-sans">&quot;standard&quot; | &quot;expert&quot; | &quot;strict&quot;</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-neutral-900 block">Example Python Snippet</span>
                      <div className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-neutral-200 overflow-x-auto">
                        <pre className="text-[11px] leading-relaxed">
{`import requests

url = "https://api.example.com/api/v1/ai/prompt-optimize"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "prompt": "Create a secure authentication middleware for Node.js Express",
    "targetModel": "gemini",
    "style": "code-focused"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(data["data"]["result"])
print("Tokens used:", data["data"]["usage"])`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Usage API */}
            {activeSection === 'usage-api' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">4. Usage & Quotas API</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-1">
                    Retrieve real-time quota metrics, monthly consumed requests, and remaining balances directly from your user account.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs font-semibold text-neutral-900">/api/usage</span>
                    </div>
                    <span className="text-[11px] text-neutral-500">Authenticated Session</span>
                  </div>
                  <div className="p-4 space-y-3 text-xs">
                    <p className="text-neutral-600">Returns percentage breakdowns for AI, API, and Web tool executions.</p>
                    <div className="rounded-lg bg-neutral-950 p-3 font-mono text-[11px] text-neutral-200">
{`{
  "success": true,
  "data": {
    "plan": "FREE",
    "used": 42,
    "limit": 6050,
    "remaining": 6008,
    "period": "monthly",
    "breakdown": {
      "aiRequests": { "used": 2, "limit": 50, "remaining": 48, "percentage": 4 },
      "apiRequests": { "used": 14, "limit": 1000, "remaining": 986, "percentage": 1 },
      "toolExecutions": { "used": 26, "limit": 5000, "remaining": 4974, "percentage": 1 }
    }
  }
}`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Rate Limits */}
            {activeSection === 'limits' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">5. Rate Limits & Quotas</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-1">
                    Rate limits and monthly quotas ensure equitable access and platform stability across all tiers.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200 font-mono text-neutral-600 text-[11px]">
                      <tr>
                        <th className="p-3">Plan Tier</th>
                        <th className="p-3">API Rate Limit</th>
                        <th className="p-3">Monthly API Calls</th>
                        <th className="p-3">Monthly AI Requests</th>
                        <th className="p-3">Max Active Keys</th>
                        <th className="p-3">Max Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                      <tr>
                        <td className="p-3 font-bold text-neutral-900">FREE</td>
                        <td className="p-3">15 req / min</td>
                        <td className="p-3">1,000 / mo</td>
                        <td className="p-3">50 / mo</td>
                        <td className="p-3">2 keys</td>
                        <td className="p-3">256 KB</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-indigo-700">PRO</td>
                        <td className="p-3">60 req / min</td>
                        <td className="p-3">50,000 / mo</td>
                        <td className="p-3">1,000 / mo</td>
                        <td className="p-3">10 keys</td>
                        <td className="p-3">5 MB</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-neutral-900">ENTERPRISE</td>
                        <td className="p-3">300 req / min</td>
                        <td className="p-3">500,000 / mo</td>
                        <td className="p-3">10,000 / mo</td>
                        <td className="p-3">50 keys</td>
                        <td className="p-3">25 MB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 6: Error Codes */}
            {activeSection === 'errors' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">6. Error Codes & Diagnostics</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-1">
                    ByGoodAI returns standardized JSON error responses with distinct machine-readable error codes.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200 font-mono text-neutral-600 text-[11px]">
                      <tr>
                        <th className="p-3">HTTP Status</th>
                        <th className="p-3">Error Code</th>
                        <th className="p-3">Meaning</th>
                        <th className="p-3">Remedy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                      <tr>
                        <td className="p-3 font-bold text-amber-600">401 Unauthorized</td>
                        <td className="p-3 text-rose-600">INVALID_API_KEY</td>
                        <td className="p-3 font-sans">API key is missing or not recognized</td>
                        <td className="p-3 font-sans">Check Authorization header format</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-600">401 Unauthorized</td>
                        <td className="p-3 text-rose-600">REVOKED_API_KEY</td>
                        <td className="p-3 font-sans">Key was previously revoked by user</td>
                        <td className="p-3 font-sans">Generate a new key in Settings</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-600">401 Unauthorized</td>
                        <td className="p-3 text-rose-600">EXPIRED_API_KEY</td>
                        <td className="p-3 font-sans">Key has passed its expiry date</td>
                        <td className="p-3 font-sans">Generate a new key</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-rose-600">429 Rate Limited</td>
                        <td className="p-3 text-rose-600">RATE_LIMITED</td>
                        <td className="p-3 font-sans">Exceeded per-minute request rate</td>
                        <td className="p-3 font-sans">Throttle requests or upgrade plan</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-rose-600">429 Rate Limited</td>
                        <td className="p-3 text-rose-600">USAGE_LIMIT_EXCEEDED</td>
                        <td className="p-3 font-sans">Monthly quota limit reached</td>
                        <td className="p-3 font-sans">Quota resets at month boundary (UTC)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-orange-600">413 Payload Too Large</td>
                        <td className="p-3 text-rose-600">PAYLOAD_TOO_LARGE</td>
                        <td className="p-3 font-sans">Payload exceeds plan limit</td>
                        <td className="p-3 font-sans">Reduce input size or split payload</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-orange-600">413 Payload Too Large</td>
                        <td className="p-3 text-rose-600">OUTPUT_TOO_LARGE</td>
                        <td className="p-3 font-sans">Generated tool output exceeds limit</td>
                        <td className="p-3 font-sans">Apply stricter filtering options</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-neutral-600">404 Not Found</td>
                        <td className="p-3 text-rose-600">TOOL_NOT_FOUND</td>
                        <td className="p-3 font-sans">Unknown tool slug in URL</td>
                        <td className="p-3 font-sans">Check GET /api/v1/tools for valid slugs</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-neutral-600">400 Bad Request</td>
                        <td className="p-3 text-rose-600">INVALID_TOOL_OPTIONS</td>
                        <td className="p-3 font-sans">Invalid option value or type</td>
                        <td className="p-3 font-sans">Verify options with GET /api/v1/tools/:slug</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-rose-600">503 Service Unavailable</td>
                        <td className="p-3 text-rose-600">AI_PROVIDER_NOT_CONFIGURED</td>
                        <td className="p-3 font-sans">Gemini API credentials not configured</td>
                        <td className="p-3 font-sans">Configure GEMINI_API_KEY in environment</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-rose-600">504 Gateway Timeout</td>
                        <td className="p-3 text-rose-600">AI_PROVIDER_TIMEOUT</td>
                        <td className="p-3 font-sans">AI request exceeded 20s timeout</td>
                        <td className="p-3 font-sans">Shorten prompt or retry</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-rose-600">504 Gateway Timeout</td>
                        <td className="p-3 text-rose-600">TOOL_TIMEOUT</td>
                        <td className="p-3 font-sans">Tool execution exceeded 10s timeout</td>
                        <td className="p-3 font-sans">Reduce input complexity</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
    </>
  );
};
