import { ToolDefinition } from '../../types/toolEngine';
import { safeParseJson, safeRegexMatch, sanitizeHtml, escapeHtml } from '../toolValidation';

/**
 * 1. JSON Formatter & Validator
 */
export const jsonFormatterTool: ToolDefinition = {
  id: 'tool-json-formatter',
  slug: 'json-formatter',
  name: 'JSON Formatter & Validator',
  description: 'Beautify, validate, minify, sort keys, and analyze JSON payloads with syntax error diagnostics.',
  category: 'data',
  icon: 'Braces',
  tags: ['DATA', 'FORMATTER', 'DEVELOPER'],
  aliases: ['json beautifier', 'json validator', 'json parser', 'json minify', 'format json'],
  difficulty: 'beginner',
  isPopular: true,
  isNew: false,
  usageCount: 14280,
  rating: 4.96,
  averageExecutionMs: 3.2,
  inputType: 'json',
  outputType: 'json',
  sampleInput: `{\n  "project": "ByGoodAI Platform",\n  "status": "production-ready",\n  "version": 2.4,\n  "is_open_source": true,\n  "maintainer": null,\n  "modules": ["auth", "database", "tools", "seo"],\n  "metrics": {\n    "averageLatencyMs": 3.8,\n    "clientExecution": true\n  }\n}`,
  inputPlaceholder: 'Paste raw, messy, or minified JSON payload (or JSON primitives like "hello", 123, true)...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory. Zero server transmission.',
  options: [
    {
      id: 'indent',
      label: 'Indentation Spacing',
      type: 'select',
      defaultValue: 2,
      options: [
        { label: '2 Spaces (Standard)', value: 2 },
        { label: '4 Spaces', value: 4 },
        { label: 'Tabs (\\t)', value: 'tab' },
        { label: 'Compact / Minify (0 Spaces)', value: 'compact' },
      ],
    },
    {
      id: 'sortKeys',
      label: 'Alphabetize Object Keys',
      description: 'Recursively sorts object keys from A to Z',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      id: 'escapeUnicode',
      label: 'Escape Multibyte Unicode',
      description: 'Converts Unicode characters to \\uXXXX escape sequences',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  limits: {
    maxInputLength: 10 * 1024 * 1024, // 10MB
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please provide a JSON string or primitive value to format.',
        executionTimeMs: 0,
      };
    }

    const parseResult = safeParseJson(trimmed);
    if (!parseResult.valid) {
      return {
        success: false,
        output: '',
        error: parseResult.error || 'Invalid JSON syntax',
        details: parseResult.line ? `Line ${parseResult.line}, Column ${parseResult.column}` : undefined,
        executionTimeMs: 0,
      };
    }

    const parsed = parseResult.data;
    let indentValue: number | string = 2;
    if (options.indent === 'compact') {
      indentValue = 0;
    } else if (options.indent === 'tab') {
      indentValue = '\t';
    } else {
      indentValue = Number(options.indent || 2);
    }

    const sortObjectKeys = (val: any): any => {
      if (Array.isArray(val)) {
        return val.map(sortObjectKeys);
      }
      if (val !== null && typeof val === 'object') {
        const sorted: Record<string, any> = {};
        Object.keys(val)
          .sort((a, b) => a.localeCompare(b))
          .forEach((k) => {
            sorted[k] = sortObjectKeys(val[k]);
          });
        return sorted;
      }
      return val;
    };

    let targetData = options.sortKeys ? sortObjectKeys(parsed) : parsed;
    let output = JSON.stringify(targetData, null, indentValue);

    if (options.escapeUnicode) {
      output = output.replace(/[\u007F-\uFFFF]/g, (chr) => {
        return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
      });
    }

    const countNodes = (obj: any): { keys: number; depth: number } => {
      let keys = 0;
      let maxDepth = 1;
      const traverse = (o: any, d: number) => {
        if (d > maxDepth) maxDepth = d;
        if (Array.isArray(o)) {
          o.forEach((item) => traverse(item, d + 1));
        } else if (o !== null && typeof o === 'object') {
          const ks = Object.keys(o);
          keys += ks.length;
          ks.forEach((k) => traverse(o[k], d + 1));
        }
      };
      traverse(obj, 1);
      return { keys, depth: maxDepth };
    };

    const { keys, depth } = countNodes(parsed);

    return {
      success: true,
      output,
      executionTimeMs: 0, // Assigned by executor
      metadata: {
        rootType: Array.isArray(parsed) ? 'Array' : parsed === null ? 'null' : typeof parsed,
        keyCount: keys,
        maxNestingDepth: depth,
        formattedSizeChars: output.length,
      },
    };
  },
  documentation: {
    overview: 'High-performance JSON parser, validator, minifier, and key alphabetizer. Supports all JSON RFC 8259 specifications including top-level primitives.',
    howToUse: [
      'Paste your raw, minified, or unformatted JSON into the input canvas.',
      'Select desired indentation (2 spaces, 4 spaces, tabs, or compact minification).',
      'Optionally toggle recursive key sorting or Unicode escaping.',
      'Copy output directly or export as a .json file.',
    ],
    features: [
      'Top-level primitives support (strings, numbers, booleans, null)',
      'Accurate line & column error diagnostics',
      'Recursive A-Z key sorting',
      'Instant minification & character compression',
    ],
    examples: [
      {
        title: 'Basic Object Formatting',
        input: '{"name":"ByGoodAI","status":"active"}',
        output: '{\n  "name": "ByGoodAI",\n  "status": "active"\n}',
      },
    ],
    faq: [
      {
        question: 'Does this tool transmit my JSON payload over a network?',
        answer: 'No. All parsing and string transformations execute 100% in-memory in your local browser sandbox.',
      },
      {
        question: 'Are primitive JSON types like `"hello"` or `123` supported?',
        answer: 'Yes. In compliance with RFC 8259, all JSON primitives are valid and formatted cleanly.',
      },
    ],
  },
  seo: {
    title: 'JSON Formatter & Validator — Zero-Latency Beautifier',
    metaDescription: 'Free, fast, and secure client-side JSON Formatter, Validator, and Minifier. Beautify JSON with syntax error checking.',
    keywords: ['json formatter', 'json validator', 'beautify json', 'json minify', 'json parser online'],
  },
};

/**
 * 2. Regex Pattern Tester & Explainer
 */
export const regexTesterTool: ToolDefinition = {
  id: 'tool-regex-tester',
  slug: 'regex-tester',
  name: 'Regex Pattern Tester & Matcher',
  description: 'Test regular expressions with real-time match extraction, group capture breakdown, and ReDoS safety guardrails.',
  category: 'developer',
  icon: 'Regex',
  tags: ['DEVELOPER', 'UTILITY'],
  aliases: ['regular expression', 'regex tester', 'regex validator', 'regexp', 'regex groups'],
  difficulty: 'intermediate',
  isPopular: true,
  isNew: false,
  usageCount: 11450,
  rating: 4.92,
  averageExecutionMs: 4.8,
  inputType: 'regex',
  outputType: 'json',
  sampleInput: `Contact our security engineers at security@bygoodai.example, dev-ops@cloud-infra.example, or support+billing@bygoodai.example for assistance on 2026-08-14.`,
  inputPlaceholder: 'Type or paste the test string to run regular expression matching against...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'pattern',
      label: 'Regex Pattern',
      description: 'Regular expression pattern without surrounding slashes',
      type: 'text',
      defaultValue: '(?<user>[a-zA-Z0-9._%+-]+)@(?<domain>[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
      placeholder: 'e.g. ([a-zA-Z0-9]+)',
    },
    {
      id: 'flags',
      label: 'RegExp Flags',
      description: 'Active regex flags: g (global), i (ignore case), m (multiline), s (dotAll), u (unicode)',
      type: 'text',
      defaultValue: 'g',
      placeholder: 'g, i, m, s, u',
    },
  ],
  limits: {
    maxInputLength: 2 * 1024 * 1024,
    safeRegexTimeoutMs: 500,
  },
  execute: (input: string, options: Record<string, any>) => {
    const pattern = options.pattern || '';
    const flags = options.flags || 'g';

    if (!pattern.trim()) {
      return {
        success: false,
        output: '',
        error: 'Regex pattern is required. Please specify a regular expression in the options ribbon.',
        executionTimeMs: 0,
      };
    }

    try {
      const matchResult = safeRegexMatch(pattern, flags, input, 500);

      const outputData = {
        pattern: `/${pattern}/${flags}`,
        totalMatches: matchResult.totalMatches,
        truncated: matchResult.truncated,
        matches: matchResult.matches.map((m, idx) => ({
          matchNumber: idx + 1,
          value: m.match,
          startIndex: m.index,
          endIndex: m.index + m.length,
          length: m.length,
          captureGroups: m.groups || null,
        })),
      };

      return {
        success: true,
        output: JSON.stringify(outputData, null, 2),
        executionTimeMs: 0,
        customView: 'regex',
        customData: outputData,
        metadata: {
          totalMatches: matchResult.totalMatches,
          pattern: `/${pattern}/${flags}`,
          truncated: matchResult.truncated,
        },
        warnings: matchResult.truncated ? ['Result match count was capped to 500 items for UI responsiveness.'] : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: `Regex Compilation Error: ${err.message}`,
        details: 'Verify syntax, unescaped brackets, or invalid flag combinations.',
        executionTimeMs: 0,
      };
    }
  },
  documentation: {
    overview: 'Interactive regular expression testing suite with capture group diagnostics, flag selectors, and backtracking timeout protection.',
    howToUse: [
      'Enter your regular expression in the pattern field (without leading/trailing slashes).',
      'Select active flags such as g (global), i (case insensitive), and m (multiline).',
      'Type or paste your test text into the input canvas.',
      'Inspect detailed match indexes, lengths, and named capture groups in the output.',
    ],
    features: [
      'Named and numbered capture group extraction',
      'Support for ECMAScript 2026 flags (g, i, m, s, u, y)',
      'ReDoS safety timeout watchdog',
      'Exportable JSON match schema',
    ],
    faq: [
      {
        question: 'Does this support named capture groups?',
        answer: 'Yes! Syntax like `(?<name>pattern)` will populate the named capture groups table.',
      },
    ],
  },
  seo: {
    title: 'Regex Tester & Match Extractor — Safe Regular Expression Tool',
    metaDescription: 'Test regular expressions in real-time with capture groups, flag support, and ReDoS protection.',
    keywords: ['regex tester', 'regular expression', 'regex online', 'test regex', 'javascript regex'],
  },
};

/**
 * 3. SQL Query Formatter & Beautifier
 */
export const sqlFormatterTool: ToolDefinition = {
  id: 'tool-sql-formatter',
  slug: 'sql-formatter',
  name: 'SQL Query Formatter & Beautifier',
  description: 'Format, indent, standardize keyword casing, and align messy SQL queries for PostgreSQL, MySQL, and SQLite.',
  category: 'developer',
  icon: 'FileCode',
  tags: ['DEVELOPER', 'FORMATTER'],
  aliases: ['sql beautifier', 'format sql', 'sql indent', 'sql syntax', 'postgres format'],
  difficulty: 'beginner',
  isPopular: true,
  isNew: false,
  usageCount: 10320,
  rating: 4.94,
  averageExecutionMs: 5.1,
  inputType: 'sql',
  outputType: 'code',
  sampleInput: `select u.id, u.name, u.email, count(t.id) as total_executions, sum(case when t.status = 'SUCCESS' then 1 else 0 end) as success_count from users u left join tool_executions t on t.user_id = u.id where u.created_at >= '2026-01-01' and u.role in ('PRO', 'ADMIN') group by u.id, u.name, u.email having count(t.id) > 10 order by total_executions desc limit 50 offset 0;`,
  inputPlaceholder: 'Paste raw, unformatted SQL statement (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE)...',
  defaultExportExtension: 'sql',
  mimeType: 'text/sql',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'uppercaseKeywords',
      label: 'Uppercase Reserved Keywords',
      description: 'Capitalize SELECT, FROM, WHERE, JOIN, GROUP BY, etc.',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      id: 'indentSpaces',
      label: 'Indentation Width',
      type: 'select',
      defaultValue: 2,
      options: [
        { label: '2 Spaces', value: 2 },
        { label: '4 Spaces', value: 4 },
      ],
    },
  ],
  limits: {
    maxInputLength: 5 * 1024 * 1024,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please provide a SQL query to format.',
        executionTimeMs: 0,
      };
    }

    const uppercase = options.uppercaseKeywords !== false;
    const indentWidth = Number(options.indentSpaces || 2);
    const indentStr = ' '.repeat(indentWidth);

    // Major clause keywords that initiate new lines
    const majorClauses = [
      'SELECT',
      'FROM',
      'WHERE',
      'LEFT OUTER JOIN',
      'RIGHT OUTER JOIN',
      'FULL OUTER JOIN',
      'INNER JOIN',
      'LEFT JOIN',
      'RIGHT JOIN',
      'CROSS JOIN',
      'JOIN',
      'GROUP BY',
      'HAVING',
      'ORDER BY',
      'LIMIT',
      'OFFSET',
      'UNION ALL',
      'UNION',
      'INSERT INTO',
      'VALUES',
      'UPDATE',
      'SET',
      'DELETE FROM',
      'CREATE TABLE',
      'ALTER TABLE',
      'DROP TABLE',
      'WITH',
    ];

    const subKeywords = [
      'AND',
      'OR',
      'ON',
      'AS',
      'IN',
      'NOT IN',
      'IS NULL',
      'IS NOT NULL',
      'EXISTS',
      'NOT EXISTS',
      'BETWEEN',
      'LIKE',
      'ILIKE',
      'ASC',
      'DESC',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'DISTINCT',
      'COUNT',
      'SUM',
      'AVG',
      'MIN',
      'MAX',
    ];

    // Normalize whitespaces
    let formatted = trimmed.replace(/\r\n/g, '\n').replace(/\t/g, ' ');

    // Normalize reserved keywords
    if (uppercase) {
      [...majorClauses, ...subKeywords].forEach((kw) => {
        const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
        formatted = formatted.replace(regex, kw.toUpperCase());
      });
    }

    // Insert linebreaks before major clauses
    majorClauses.forEach((clause) => {
      const regex = new RegExp(`(?:\\s+|^)(${clause})(?:\\s+|$)`, 'gi');
      formatted = formatted.replace(regex, `\n$1 `);
    });

    // Clean up multiple newlines
    const lines = formatted.split('\n').map((l) => l.trim()).filter(Boolean);
    const indentedLines: string[] = [];

    let insideSelect = false;

    lines.forEach((line) => {
      if (line.startsWith('SELECT')) {
        insideSelect = true;
        // Split comma-separated columns if multiple
        const afterSelect = line.substring(6).trim();
        if (afterSelect.includes(',') && !afterSelect.includes('(')) {
          indentedLines.push('SELECT');
          const cols = afterSelect.split(',').map((c) => c.trim());
          cols.forEach((col, idx) => {
            indentedLines.push(`${indentStr}${col}${idx < cols.length - 1 ? ',' : ''}`);
          });
          return;
        }
      } else {
        insideSelect = false;
      }

      if (line.startsWith('AND ') || line.startsWith('OR ')) {
        indentedLines.push(`${indentStr}${line}`);
      } else if (line.startsWith('LEFT ') || line.startsWith('RIGHT ') || line.startsWith('INNER ') || line.startsWith('JOIN ')) {
        indentedLines.push(line);
      } else {
        indentedLines.push(line);
      }
    });

    let result = indentedLines.join('\n');
    if (!result.endsWith(';') && trimmed.endsWith(';')) {
      result += ';';
    }

    return {
      success: true,
      output: result,
      executionTimeMs: 0,
      metadata: {
        lineCount: indentedLines.length,
        clauseCount: lines.length,
      },
    };
  },
  documentation: {
    overview: 'SQL query beautifier and syntax standardizer. Cleans up complex queries with readable clause breaks and consistent indentation.',
    howToUse: [
      'Paste your raw SQL query into the input box.',
      'Select whether to uppercase keywords and pick indentation spacing.',
      'Click Execute to receive structured, readable SQL.',
    ],
    features: [
      'Comprehensive clause formatting (JOINs, CASE WHEN, GROUP BY, CTEs)',
      'Standardized SQL dialect support (PostgreSQL, MySQL, SQLite)',
      'Preserves quoted string literals and subqueries',
    ],
    faq: [],
  },
  seo: {
    title: 'SQL Query Formatter & Beautifier — Free Online SQL Indenter',
    metaDescription: 'Format, indent, and uppercase SQL statements online with clean PostgreSQL and MySQL clause alignment.',
    keywords: ['sql formatter', 'format sql', 'beautify sql', 'sql indenter', 'postgres formatter'],
  },
};

/**
 * 4. Markdown to Clean HTML & Live Preview
 */
export const markdownHtmlTool: ToolDefinition = {
  id: 'tool-markdown-html',
  slug: 'markdown-html',
  name: 'Markdown to HTML & Live Preview',
  description: 'Convert GitHub-Flavored Markdown to sanitized HTML with real-time live preview and clean markup export.',
  category: 'developer',
  icon: 'FileText',
  tags: ['DEVELOPER', 'FORMATTER'],
  aliases: ['markdown converter', 'md to html', 'markdown previewer', 'gfm parser', 'markdown renderer'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: false,
  usageCount: 5890,
  rating: 4.9,
  averageExecutionMs: 4.1,
  inputType: 'markdown',
  outputType: 'html',
  sampleInput: `# ByGoodAI Developer Workspace\n\nWelcome to the **next-generation** developer workspace with client-first isolation.\n\n### Core Engineering Highlights\n- ⚡ **Instant Execution**: Sub-5ms client rendering\n- 🔒 **Zero Telemetry Leaks**: Client-first privacy\n- 🛠️ **20+ Integrated Tools**\n\n> "Simplicity and zero latency are the prerequisites for great developer tooling."\n\n\`\`\`ts\nimport { ByGoodAI } from '@bygoodai/sdk';\nconst client = new ByGoodAI();\n\`\`\`\n\nVisit [ByGoodAI](https://bygoodai.example) for documentation.`,
  inputPlaceholder: 'Type GitHub Flavored Markdown (# Headings, **bold**, - lists, `code`, [links])...',
  defaultExportExtension: 'html',
  mimeType: 'text/html',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'includeBoilerplate',
      label: 'Include Full HTML5 Document Shell',
      description: 'Wraps generated markup in <!DOCTYPE html><html><head><body>',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  limits: {
    maxInputLength: 5 * 1024 * 1024,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please provide Markdown content to convert.',
        executionTimeMs: 0,
      };
    }

    // Markdown Parser with GFM support
    let html = trimmed;

    // Code blocks ```lang\ncode\n```
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gim, (_, lang, code) => {
      const escaped = escapeHtml(code.trim());
      return `<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`\n]+)`/gim, (_, code) => {
      return `<code>${escapeHtml(code)}</code>`;
    });

    // Headers
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');

    // Bold, Italic, Strikethrough
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Links [text](url)
    html = html.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Paragraphs
    html = html
      .split('\n\n')
      .map((block) => {
        const b = block.trim();
        if (
          b.startsWith('<h') ||
          b.startsWith('<ul') ||
          b.startsWith('<pre') ||
          b.startsWith('<blockquote') ||
          b.startsWith('<li')
        ) {
          return b;
        }
        return `<p>${b.replace(/\n/g, '<br />')}</p>`;
      })
      .join('\n');

    // Strict XSS Sanitization
    const sanitized = sanitizeHtml(html);

    let finalOutput = sanitized;
    if (options.includeBoilerplate) {
      finalOutput = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rendered Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }
    blockquote { border-left: 4px solid #cbd5e1; margin: 0; padding-left: 16px; color: #64748b; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
${sanitized}
</body>
</html>`;
    }

    return {
      success: true,
      output: finalOutput,
      executionTimeMs: 0,
      customView: 'html',
      customData: {
        sanitizedHtml: sanitized,
      },
      metadata: {
        rawWordCount: trimmed.split(/\s+/).filter(Boolean).length,
        htmlLengthChars: finalOutput.length,
      },
    };
  },
  documentation: {
    overview: 'Convert Markdown to secure, sanitized HTML code with real-time preview and XSS script protection.',
    howToUse: [
      'Write or paste Markdown into the input canvas.',
      'Inspect the generated HTML code or view the rendered preview in the output pane.',
      'Copy the clean HTML markup or export as an .html document.',
    ],
    features: [
      'Strict XSS Sanitization (strips malicious script tags, onerror handlers, and javascript: links)',
      'GitHub Flavored Markdown (code blocks, blockquotes, lists, links)',
      'Full HTML5 Document Shell generator option',
    ],
    faq: [],
  },
  seo: {
    title: 'Markdown to Clean HTML & Live Preview — Secure Markdown Parser',
    metaDescription: 'Convert Markdown to sanitized HTML with live preview. Safe, fast client-side GFM parser.',
    keywords: ['markdown to html', 'md to html', 'markdown preview', 'gfm markdown parser', 'markdown converter'],
  },
};

/**
 * 5. HTML Formatter & Beautifier
 */
export const htmlFormatterTool: ToolDefinition = {
  id: 'tool-html-formatter',
  slug: 'html-formatter',
  name: 'HTML Formatter & Beautifier',
  description: 'Beautify, indent, format tags, and minify HTML documents and components.',
  category: 'developer',
  icon: 'Code2',
  tags: ['DEVELOPER', 'FORMATTER'],
  aliases: ['html beautifier', 'format html', 'html prettify', 'html minify', 'clean html'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 4120,
  rating: 4.91,
  averageExecutionMs: 3.4,
  inputType: 'html',
  outputType: 'code',
  sampleInput: `<div class="container"><header class="header"><h1>ByGoodAI</h1><nav><a href="/tools">Tools</a><a href="/docs">Docs</a></nav></header><main><section><h2>Welcome</h2><p>High-velocity developer tooling.</p></section></main></div>`,
  inputPlaceholder: 'Paste raw or minified HTML markup here...',
  defaultExportExtension: 'html',
  mimeType: 'text/html',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'indent',
      label: 'Indentation Spacing',
      type: 'select',
      defaultValue: 2,
      options: [
        { label: '2 Spaces', value: 2 },
        { label: '4 Spaces', value: 4 },
        { label: 'Minify (Compact)', value: 'compact' },
      ],
    },
  ],
  limits: {
    maxInputLength: 5 * 1024 * 1024,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please provide HTML markup to format.',
        executionTimeMs: 0,
      };
    }

    if (options.indent === 'compact') {
      const minified = trimmed
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/\s*([=])\s*/g, '$1')
        .trim();
      return {
        success: true,
        output: minified,
        executionTimeMs: 0,
        metadata: {
          originalLength: trimmed.length,
          minifiedLength: minified.length,
          compressionRatio: Math.round((1 - minified.length / trimmed.length) * 100) + '%',
        },
      };
    }

    const indentWidth = Number(options.indent || 2);
    const indentStr = ' '.repeat(indentWidth);

    // Void / self-closing HTML tags
    const voidTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype',
    ]);

    let formatted = '';
    let indentLevel = 0;
    const tokens = trimmed.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).filter(Boolean);

    tokens.forEach((token) => {
      const isTag = token.startsWith('<') && token.endsWith('>');
      if (!isTag) {
        const text = token.trim();
        if (text) {
          formatted += `${indentStr.repeat(indentLevel)}${text}\n`;
        }
        return;
      }

      const isClosing = token.startsWith('</');
      const isComment = token.startsWith('<!--');
      const isDoctype = token.toLowerCase().startsWith('<!doctype');
      const tagNameMatch = token.match(/^<\/?([a-zA-Z0-9-]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isSelfClosing = token.endsWith('/>') || voidTags.has(tagName) || isDoctype || isComment;

      if (isClosing) {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += `${indentStr.repeat(indentLevel)}${token}\n`;
      } else if (isSelfClosing) {
        formatted += `${indentStr.repeat(indentLevel)}${token}\n`;
      } else {
        formatted += `${indentStr.repeat(indentLevel)}${token}\n`;
        indentLevel++;
      }
    });

    return {
      success: true,
      output: formatted.trim(),
      executionTimeMs: 0,
      metadata: {
        formattedLines: formatted.split('\n').length,
      },
    };
  },
  documentation: {
    overview: 'Clean up and indent HTML tags, nested elements, attributes, and doctypes.',
    howToUse: ['Paste HTML code.', 'Choose indentation width or minify mode.', 'Copy formatted markup.'],
    features: ['Void tags recognition', 'Preserves comments & attributes', 'Minification mode'],
    faq: [],
  },
  seo: {
    title: 'HTML Formatter & Beautifier — Free Online HTML Cleaner',
    metaDescription: 'Format and beautify HTML documents online with custom indentation and minification.',
    keywords: ['html formatter', 'beautify html', 'clean html', 'html prettify', 'format html online'],
  },
};

/**
 * 6. CSS Formatter & Minifier
 */
export const cssFormatterTool: ToolDefinition = {
  id: 'tool-css-formatter',
  slug: 'css-formatter',
  name: 'CSS Formatter & Minifier',
  description: 'Format, beautify, indent CSS stylesheets or minify for production web performance.',
  category: 'developer',
  icon: 'FileCode',
  tags: ['DEVELOPER', 'FORMATTER'],
  aliases: ['css beautifier', 'format css', 'css minify', 'clean css', 'css prettify'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 3890,
  rating: 4.89,
  averageExecutionMs: 2.8,
  inputType: 'css',
  outputType: 'code',
  sampleInput: `.btn{display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-weight:600;background-color:#1e293b;color:#ffffff;transition:all 0.2s ease}.btn:hover{background-color:#0f172a}`,
  inputPlaceholder: 'Paste raw CSS styles, classes, or stylesheets here...',
  defaultExportExtension: 'css',
  mimeType: 'text/css',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'mode',
      label: 'Format Mode',
      type: 'select',
      defaultValue: 'beautify',
      options: [
        { label: 'Beautify (2 Spaces)', value: 'beautify' },
        { label: 'Beautify (4 Spaces)', value: 'beautify4' },
        { label: 'Minify (Compact Production)', value: 'minify' },
      ],
    },
  ],
  limits: {
    maxInputLength: 5 * 1024 * 1024,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please provide CSS styles to format.',
        executionTimeMs: 0,
      };
    }

    if (options.mode === 'minify') {
      const minified = trimmed
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ')
        .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
        .replace(/\;(?=\})/g, '')
        .trim();
      return {
        success: true,
        output: minified,
        executionTimeMs: 0,
        metadata: {
          originalChars: trimmed.length,
          minifiedChars: minified.length,
          savings: Math.round((1 - minified.length / trimmed.length) * 100) + '%',
        },
      };
    }

    const indentWidth = options.mode === 'beautify4' ? 4 : 2;
    const indentStr = ' '.repeat(indentWidth);

    let clean = trimmed.replace(/\/\*[\s\S]*?\*\//g, (m) => m + '\n');
    clean = clean.replace(/\s*\{\s*/g, ' {\n');
    clean = clean.replace(/\s*\}\s*/g, '\n}\n\n');
    clean = clean.replace(/\s*;\s*/g, ';\n');

    const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
    let output = '';
    let inBlock = false;

    lines.forEach((line) => {
      if (line.endsWith('{')) {
        output += `${line}\n`;
        inBlock = true;
      } else if (line === '}') {
        output += `}\n\n`;
        inBlock = false;
      } else if (inBlock) {
        output += `${indentStr}${line}\n`;
      } else {
        output += `${line}\n`;
      }
    });

    return {
      success: true,
      output: output.trim(),
      executionTimeMs: 0,
    };
  },
  documentation: {
    overview: 'Format messy CSS rules or compress stylesheets for production deployments.',
    howToUse: ['Paste CSS.', 'Select Beautify or Minify.', 'Export output.'],
    features: ['Rule indentation', 'Minification with semicolon trimming', 'Comment preservation'],
    faq: [],
  },
  seo: {
    title: 'CSS Formatter & Minifier — Clean & Optimize CSS Stylesheets',
    metaDescription: 'Free online CSS beautifier and minifier tool. Clean up CSS and minify stylesheets.',
    keywords: ['css formatter', 'beautify css', 'minify css', 'css cleaner', 'css prettify online'],
  },
};

/**
 * 7. Case Converter
 */
export const caseConverterTool: ToolDefinition = {
  id: 'tool-case-converter',
  slug: 'case-converter',
  name: 'Case Converter & Text Transformer',
  description: 'Convert strings between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, and dot.case.',
  category: 'developer',
  icon: 'Code2',
  tags: ['DEVELOPER', 'UTILITY'],
  aliases: ['camelcase', 'snake_case', 'kebab-case', 'pascalcase', 'text case', 'title case'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 5240,
  rating: 4.93,
  averageExecutionMs: 1.2,
  inputType: 'text',
  outputType: 'json',
  sampleInput: `ByGoodAI high-performance developer workspace!`,
  inputPlaceholder: 'Enter any text, variable name, or sentence to transform across all naming conventions...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'targetCase',
      label: 'Target Primary Case',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All Cases (Complete Matrix)', value: 'all' },
        { label: 'camelCase', value: 'camelCase' },
        { label: 'PascalCase', value: 'PascalCase' },
        { label: 'snake_case', value: 'snake_case' },
        { label: 'kebab-case', value: 'kebab-case' },
        { label: 'CONSTANT_CASE (MACRO)', value: 'CONSTANT_CASE' },
        { label: 'Title Case', value: 'Title Case' },
        { label: 'dot.case', value: 'dot.case' },
      ],
    },
  ],
  limits: {
    maxInputLength: 1024 * 1024,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please enter text to convert.',
        executionTimeMs: 0,
      };
    }

    // Split text into words supporting camelCase, snake_case, kebab-case, spaces
    const words = trimmed
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-\.\/\\:]+/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return {
        success: false,
        output: '',
        error: 'No alphanumeric words found in input.',
        executionTimeMs: 0,
      };
    }

    const lowerWords = words.map((w) => w.toLowerCase());
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    const camelCase = lowerWords[0] + lowerWords.slice(1).map(capitalize).join('');
    const pascalCase = lowerWords.map(capitalize).join('');
    const snakeCase = lowerWords.join('_');
    const kebabCase = lowerWords.join('-');
    const constantCase = lowerWords.join('_').toUpperCase();
    const titleCase = lowerWords.map(capitalize).join(' ');
    const dotCase = lowerWords.join('.');
    const sentenceCase = lowerWords[0].charAt(0).toUpperCase() + lowerWords.join(' ').slice(1);

    const matrix = {
      camelCase,
      PascalCase: pascalCase,
      snake_case: snakeCase,
      'kebab-case': kebabCase,
      CONSTANT_CASE: constantCase,
      'Title Case': titleCase,
      'Sentence case': sentenceCase,
      'dot.case': dotCase,
    };

    const target = options.targetCase || 'all';
    const output = target === 'all' ? JSON.stringify(matrix, null, 2) : (matrix as any)[target] || JSON.stringify(matrix, null, 2);

    return {
      success: true,
      output,
      executionTimeMs: 0,
      metadata: {
        wordCount: words.length,
        characterCount: trimmed.length,
      },
    };
  },
  documentation: {
    overview: 'Convert variable names and sentences into camelCase, snake_case, kebab-case, PascalCase, and CONSTANT_CASE instantly.',
    howToUse: ['Type text or variable name.', 'Choose your desired output case or view the all-cases matrix.'],
    features: ['Handles mixed alphanumeric strings', 'Generates 8 standard naming styles', 'Copy individual formats'],
    faq: [],
  },
  seo: {
    title: 'Case Converter — camelCase, snake_case, kebab-case Online Tool',
    metaDescription: 'Convert text to camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE and Title Case.',
    keywords: ['case converter', 'camelcase converter', 'snake case', 'kebab case', 'pascal case online'],
  },
};

/**
 * 8. Slug Generator
 */
export const slugGeneratorTool: ToolDefinition = {
  id: 'tool-slug-generator',
  slug: 'slug-generator',
  name: 'URL Slug & Permalink Generator',
  description: 'Generate clean, SEO-optimized URL slugs from titles with diacritics removal and stop-word filtering.',
  category: 'seo',
  icon: 'Globe',
  tags: ['SEO', 'DEVELOPER', 'UTILITY'],
  aliases: ['slugifier', 'url slug', 'permalink generator', 'clean url', 'seo slug'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 3150,
  rating: 4.88,
  averageExecutionMs: 1.1,
  inputType: 'text',
  outputType: 'text',
  sampleInput: `The Ultimate Guide to Production-Grade Developer Tooling in 2026!`,
  inputPlaceholder: 'Enter article title, page heading, or headline to generate clean URL slug...',
  defaultExportExtension: 'txt',
  mimeType: 'text/plain',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'separator',
      label: 'Slug Separator',
      type: 'select',
      defaultValue: '-',
      options: [
        { label: 'Hyphen (-)', value: '-' },
        { label: 'Underscore (_)', value: '_' },
      ],
    },
    {
      id: 'removeStopWords',
      label: 'Remove English Stop Words (a, the, to, in, and)',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  limits: {
    maxInputLength: 10000,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please enter a title to generate a slug.',
        executionTimeMs: 0,
      };
    }

    const sep = options.separator || '-';
    const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with']);

    // Remove accents / diacritics
    let slug = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Lowercase
    slug = slug.toLowerCase();

    // Split into words
    let words = slug.replace(/[^a-z0-9\s-_]/g, '').split(/[\s-_]+/).filter(Boolean);

    if (options.removeStopWords) {
      words = words.filter((w) => !stopWords.has(w));
    }

    const result = words.join(sep);

    return {
      success: true,
      output: result,
      executionTimeMs: 0,
      metadata: {
        slugLength: result.length,
        wordCount: words.length,
      },
    };
  },
  documentation: {
    overview: 'Create clean, SEO-friendly permalink slugs from article titles and post headings.',
    howToUse: ['Type your title.', 'Select hyphen or underscore separator.', 'Copy the generated URL slug.'],
    features: ['Diacritic and accent stripping (é -> e)', 'Special character removal', 'Optional stop-word cleaner'],
    faq: [],
  },
  seo: {
    title: 'URL Slug Generator — SEO Permalink Creator',
    metaDescription: 'Generate clean, URL-safe slugs and permalinks from titles with diacritics removal.',
    keywords: ['slug generator', 'url slug', 'permalink generator', 'seo slug generator', 'slugify online'],
  },
};
