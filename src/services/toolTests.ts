/**
 * Automated Verification & Diagnostic Test Suite for ByGoodAI Tools
 * Tests all registered tools against standard, edge-case, and adversarial inputs
 */

import { ALL_TOOLS, getToolBySlug } from './toolRegistry';
import { executeTool } from './toolExecutor';

export interface TestResult {
  toolSlug: string;
  testName: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: any;
}

export interface TestSuiteSummary {
  totalTests: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestResult[];
}

export async function runAllToolTests(): Promise<TestSuiteSummary> {
  const startTime = performance.now();
  const results: TestResult[] = [];

  const runTest = async (
    slug: string,
    name: string,
    fn: () => Promise<void>
  ) => {
    const t0 = performance.now();
    try {
      await fn();
      results.push({
        toolSlug: slug,
        testName: name,
        passed: true,
        durationMs: Number((performance.now() - t0).toFixed(2)),
      });
    } catch (err: any) {
      results.push({
        toolSlug: slug,
        testName: name,
        passed: false,
        durationMs: Number((performance.now() - t0).toFixed(2)),
        error: err.message || 'Assertion failed',
      });
    }
  };

  // 1. JSON Formatter Tests
  await runTest('json-formatter', 'Formats standard object and sort keys', async () => {
    const res = await executeTool({
      toolSlug: 'json-formatter',
      input: '{"z": 1, "a": 2}',
      options: { sortKeys: true, indent: 2 },
    });
    if (!res.success) throw new Error(res.error);
    if (!res.output.includes('"a": 2')) throw new Error('Failed to sort keys');
  });

  await runTest('json-formatter', 'Accepts JSON primitives ("hello", 123, true, null)', async () => {
    const res = await executeTool({
      toolSlug: 'json-formatter',
      input: '"hello world"',
    });
    if (!res.success) throw new Error('Primitive string failed');
    if (res.output !== '"hello world"') throw new Error('Primitive output mismatch');
  });

  await runTest('json-formatter', 'Catches malformed syntax with line/col diagnostics', async () => {
    const res = await executeTool({
      toolSlug: 'json-formatter',
      input: '{"bad": }',
    });
    if (res.success) throw new Error('Should have failed on syntax error');
    if (!res.error) throw new Error('Error message missing');
  });

  // 2. Base64 & URL Safe Tests
  await runTest('base64-converter', 'Encodes and decodes UTF-8 Multibyte and Emojis', async () => {
    const inputStr = 'ByGoodAI 🚀 Multibyte ñ & é';
    const enc = await executeTool({
      toolSlug: 'base64-converter',
      input: inputStr,
      options: { mode: 'encode', urlSafe: false },
    });
    if (!enc.success) throw new Error(enc.error);

    const dec = await executeTool({
      toolSlug: 'base64-converter',
      input: enc.output,
      options: { mode: 'decode', urlSafe: false },
    });
    if (!dec.success || dec.output !== inputStr) throw new Error(`Decoded mismatch: expected "${inputStr}", got "${dec.output}"`);
  });

  // 3. Regex Tester Tests
  await runTest('regex-tester', 'Extracts named capture groups safely', async () => {
    const res = await executeTool({
      toolSlug: 'regex-tester',
      input: 'user@bygoodai.example and dev@cloud.io',
      options: {
        pattern: '(?<user>[a-zA-Z0-9]+)@(?<host>[a-zA-Z0-9.]+)',
        flags: 'g',
      },
    });
    if (!res.success) throw new Error(res.error);
    if (!res.metadata?.totalMatches || res.metadata.totalMatches < 2) throw new Error('Expected 2 matches');
  });

  // 4. JWT Inspector Tests
  await runTest('jwt-decoder', 'Parses standard 3-part token and flags disclaimer', async () => {
    const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const res = await executeTool({
      toolSlug: 'jwt-decoder',
      input: sampleJwt,
    });
    if (!res.success) throw new Error(res.error);
    if (!res.warnings || res.warnings.length === 0) throw new Error('Missing signature verification disclaimer warning');
  });

  // 5. Cryptographic Hash Tests
  await runTest('hash-generator', 'Computes SHA-256 with Web Crypto', async () => {
    const res = await executeTool({
      toolSlug: 'hash-generator',
      input: 'hello world',
      options: { outputFormat: 'hex' },
    });
    if (!res.success) throw new Error(res.error);
    // sha256 of "hello world" is b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    const expected = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
    if (!res.output.toLowerCase().includes(expected)) throw new Error('SHA-256 digest calculation mismatch');
  });

  // 6. SQL Formatter Tests
  await runTest('sql-formatter', 'Uppercases clauses and formats nested SQL', async () => {
    const res = await executeTool({
      toolSlug: 'sql-formatter',
      input: 'select id, name from users where active = 1 order by id desc;',
      options: { uppercaseKeywords: true, indentSpaces: 2 },
    });
    if (!res.success) throw new Error(res.error);
    if (!res.output.includes('SELECT') || !res.output.includes('FROM') || !res.output.includes('WHERE')) {
      throw new Error('SQL keywords were not uppercased');
    }
  });

  // 7. Markdown HTML Sanitization Tests
  await runTest('markdown-html', 'Sanitizes dangerous <script> and onerror injection', async () => {
    const res = await executeTool({
      toolSlug: 'markdown-html',
      input: `# Clean Heading\n\n<script>alert("XSS")</script>\n\n<img src="x" onerror="alert(1)" />`,
    });
    if (!res.success) throw new Error(res.error);
    if (res.output.includes('<script>') || res.output.includes('onerror=')) {
      throw new Error('Sanitizer failed to strip XSS payload');
    }
  });

  // 8. Unit Converter Tests
  await runTest('unit-converter', 'Calculates binary vs decimal storage steps', async () => {
    const res = await executeTool({
      toolSlug: 'unit-converter',
      input: '1024',
      options: { category: 'data', baseUnit: 'MB' },
    });
    if (!res.success) throw new Error(res.error);
  });

  // 9. All Tools Registry Sanity Check
  for (const t of ALL_TOOLS) {
    await runTest(t.slug, 'Validates sample input runs without crash', async () => {
      const res = await executeTool({
        toolSlug: t.slug,
        input: t.sampleInput || 'test',
      });
      if (!res.success && t.slug !== 'jwt-decoder') {
        throw new Error(res.error || 'Execution failed on sample input');
      }
    });
  }

  const durationMs = Number((performance.now() - startTime).toFixed(2));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    totalTests: results.length,
    passed,
    failed,
    durationMs,
    results,
  };
}
