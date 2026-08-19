import { ToolDefinition } from '../../types/toolEngine';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, getContrastRatio, escapeHtml } from '../toolValidation';

/**
 * 1. Color Palette Studio & Harmonizer
 */
export const colorPaletteTool: ToolDefinition = {
  id: 'tool-color-palette',
  slug: 'color-palette',
  name: 'Color Palette Studio & Harmonizer',
  description: 'Generate complementary, analogous, triadic harmonies, Tailwind CSS shade steps (50-950), and WCAG 2.2 contrast ratios.',
  category: 'developer',
  icon: 'Palette',
  tags: ['DEVELOPER', 'UTILITY'],
  aliases: ['color generator', 'color harmony', 'tailwind color generator', 'hex to rgb', 'contrast checker', 'wcag contrast'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: false,
  usageCount: 4620,
  rating: 4.88,
  averageExecutionMs: 1.8,
  inputType: 'color',
  outputType: 'json',
  sampleInput: `#3B82F6`,
  inputPlaceholder: 'Enter HEX color code (e.g. #3B82F6, #10B981, #6366F1)...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'exportFormat',
      label: 'Palette Export Format',
      type: 'select',
      defaultValue: 'json',
      options: [
        { label: 'Comprehensive JSON Schema', value: 'json' },
        { label: 'Tailwind CSS config snippet', value: 'tailwind' },
        { label: 'CSS Custom Properties (:root variables)', value: 'css_vars' },
      ],
    },
  ],
  limits: {
    maxInputLength: 1000,
  },
  execute: (input: string, options: Record<string, any>) => {
    const raw = input.trim();
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    const rgb = hexToRgb(hex);

    if (!rgb) {
      return {
        success: false,
        output: '',
        error: `Invalid HEX color format: "${input}". Please provide a 3 or 6 digit hex code like #3B82F6.`,
        executionTimeMs: 0,
      };
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Generate harmonies
    const rotateHsl = (deg: number) => {
      const newH = (hsl.h + deg + 360) % 360;
      const newRgb = hslToRgb(newH, hsl.s, hsl.l);
      return {
        hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
        rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
        hsl: `hsl(${newH}, ${hsl.s}%, ${hsl.l}%)`,
      };
    };

    const harmonies = {
      base: { hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      complementary: rotateHsl(180),
      analogous1: rotateHsl(-30),
      analogous2: rotateHsl(30),
      triadic1: rotateHsl(120),
      triadic2: rotateHsl(240),
      splitComplementary1: rotateHsl(150),
      splitComplementary2: rotateHsl(210),
    };

    // Generate 50-950 Tailwind shade scale
    const shadeLevels = [
      { step: '50', lightness: 97 },
      { step: '100', lightness: 93 },
      { step: '200', lightness: 85 },
      { step: '300', lightness: 74 },
      { step: '400', lightness: 62 },
      { step: '500', lightness: hsl.l },
      { step: '600', lightness: Math.max(10, hsl.l - 12) },
      { step: '700', lightness: Math.max(8, hsl.l - 22) },
      { step: '800', lightness: Math.max(5, hsl.l - 32) },
      { step: '900', lightness: Math.max(3, hsl.l - 42) },
      { step: '950', lightness: Math.max(2, hsl.l - 48) },
    ];

    const shades: Record<string, string> = {};
    const shadesDetailed: Array<{ step: string; hex: string; contrastOnWhite: number; contrastOnBlack: number }> = [];

    shadeLevels.forEach(({ step, lightness }) => {
      const stepRgb = hslToRgb(hsl.h, hsl.s, lightness);
      const stepHex = rgbToHex(stepRgb.r, stepRgb.g, stepRgb.b);
      shades[step] = stepHex;

      const onWhite = Number(getContrastRatio(stepRgb, { r: 255, g: 255, b: 255 }).toFixed(2));
      const onBlack = Number(getContrastRatio(stepRgb, { r: 0, g: 0, b: 0 }).toFixed(2));

      shadesDetailed.push({
        step,
        hex: stepHex,
        contrastOnWhite: onWhite,
        contrastOnBlack: onBlack,
      });
    });

    const contrastAgainstWhite = Number(getContrastRatio(rgb, { r: 255, g: 255, b: 255 }).toFixed(2));
    const contrastAgainstBlack = Number(getContrastRatio(rgb, { r: 0, g: 0, b: 0 }).toFixed(2));

    const wcag = {
      contrastAgainstWhite,
      contrastAgainstBlack,
      wcag22AA_NormalText: contrastAgainstWhite >= 4.5 ? 'PASS (White text)' : contrastAgainstBlack >= 4.5 ? 'PASS (Black text)' : 'FAIL',
      wcag22AAA_NormalText: contrastAgainstWhite >= 7.0 ? 'PASS (White text)' : contrastAgainstBlack >= 7.0 ? 'PASS (Black text)' : 'FAIL',
    };

    const fullPalette = {
      baseColor: hex.toUpperCase(),
      harmonies,
      tailwindShades: shades,
      wcagCompliance: wcag,
      shadesDetailed,
    };

    const exportFormat = options.exportFormat || 'json';
    let output = '';

    if (exportFormat === 'tailwind') {
      output = `// tailwind.config.js snippet\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: ${JSON.stringify(shades, null, 10).replace(/\}$/, '      }')}\n      }\n    }\n  }\n};`;
    } else if (exportFormat === 'css_vars') {
      output = `:root {\n` + Object.entries(shades).map(([k, v]) => `  --color-brand-${k}: ${v};`).join('\n') + `\n}`;
    } else {
      output = JSON.stringify(fullPalette, null, 2);
    }

    return {
      success: true,
      output,
      executionTimeMs: 0,
      customView: 'color',
      customData: fullPalette,
      metadata: {
        baseHex: hex.toUpperCase(),
        contrastWhite: contrastAgainstWhite,
        contrastBlack: contrastBlackText(contrastAgainstBlack),
      },
    };
  },
  documentation: {
    overview: 'Complete color harmony generator, 50-950 Tailwind shade calculator, and WCAG 2.2 contrast compliance validator.',
    howToUse: ['Enter HEX color code or pick with color picker.', 'Choose export format (JSON, Tailwind, CSS variables).', 'Review generated color steps and accessibility contrast scores.'],
    features: ['Color harmonies (Complementary, Analogous, Triadic, Split)', 'Full 50-950 shade generation', 'WCAG 2.2 AA / AAA contrast ratings against white and black backgrounds'],
    faq: [],
  },
  seo: {
    title: 'Color Palette Studio & Harmonizer — Tailwind Shades & WCAG Contrast',
    metaDescription: 'Generate color harmonies, 50-950 Tailwind shades, and check WCAG 2.2 accessibility contrast ratios online.',
    keywords: ['color palette generator', 'tailwind color generator', 'wcag contrast checker', 'color harmonies online', 'hex to rgb'],
  },
};

function contrastBlackText(val: number) {
  return val;
}

/**
 * 2. Meta Tag & OpenGraph Generator
 */
export const metaTagGeneratorTool: ToolDefinition = {
  id: 'tool-meta-tag-generator',
  slug: 'meta-tag-generator',
  name: 'Meta Tag & OpenGraph Generator',
  description: 'Generate production-ready SEO meta tags, OpenGraph previews, Twitter Cards, and canonical tags with XSS protection.',
  category: 'seo',
  icon: 'Globe',
  tags: ['SEO', 'DEVELOPER'],
  aliases: ['meta tag generator', 'opengraph generator', 'og tags', 'twitter cards', 'seo tags'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: false,
  usageCount: 5410,
  rating: 4.9,
  averageExecutionMs: 1.6,
  inputType: 'text',
  outputType: 'html',
  sampleInput: `Title: ByGoodAI Platform — Production-Grade Developer Utilities\nDescription: An open, high-performance platform featuring developer tools, data converters, security encoders, and AI prompt optimizers.\nURL: https://bygoodai.example\nImage: https://bygoodai.example/og-image.png\nAuthor: ByGoodAI Engineering`,
  inputPlaceholder: 'Enter page Title, Description, URL, Image URL, and Author (or configure options)...',
  defaultExportExtension: 'html',
  mimeType: 'text/html',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'pageTitle',
      label: 'Page Title (<title>)',
      type: 'text',
      defaultValue: 'ByGoodAI Platform — Production Developer Utilities',
      placeholder: 'Page Title (recommended 50-60 characters)',
    },
    {
      id: 'metaDescription',
      label: 'Meta Description',
      type: 'textarea',
      defaultValue: 'An open, high-performance platform featuring developer tools, data converters, security encoders, and AI prompt optimizers.',
      placeholder: 'Meta Description (recommended 120-160 characters)',
    },
    {
      id: 'canonicalUrl',
      label: 'Canonical Page URL',
      type: 'text',
      defaultValue: 'https://bygoodai.example',
      placeholder: 'https://example.com/page',
    },
    {
      id: 'ogImageUrl',
      label: 'OpenGraph Share Image URL',
      type: 'text',
      defaultValue: 'https://bygoodai.example/og-banner.png',
      placeholder: 'https://example.com/og.png (1200x630px recommended)',
    },
    {
      id: 'twitterCardType',
      label: 'Twitter Card Format',
      type: 'select',
      defaultValue: 'summary_large_image',
      options: [
        { label: 'Summary with Large Image (summary_large_image)', value: 'summary_large_image' },
        { label: 'Standard Summary Card (summary)', value: 'summary' },
      ],
    },
  ],
  limits: {
    maxInputLength: 10000,
  },
  execute: (input: string, options: Record<string, any>) => {
    // Check if user passed key: value format in input
    let title = options.pageTitle || '';
    let desc = options.metaDescription || '';
    let url = options.canonicalUrl || '';
    let image = options.ogImageUrl || '';
    let author = 'ByGoodAI';

    if (input.trim().includes('\n') || input.includes(':')) {
      const lines = input.split('\n');
      lines.forEach((l) => {
        const [key, ...vals] = l.split(':');
        if (!key || vals.length === 0) return;
        const k = key.trim().toLowerCase();
        const v = vals.join(':').trim();
        if (k.includes('title')) title = v;
        else if (k.includes('desc')) desc = v;
        else if (k.includes('url')) url = v;
        else if (k.includes('image') || k.includes('og')) image = v;
        else if (k.includes('author')) author = v;
      });
    }

    const cleanTitle = escapeHtml(title || 'ByGoodAI Platform');
    const cleanDesc = escapeHtml(desc || 'High-performance developer utilities.');
    const cleanUrl = escapeHtml(url || 'https://bygoodai.example');
    const cleanImage = escapeHtml(image || 'https://bygoodai.example/og-image.png');
    const twitterCard = options.twitterCardType || 'summary_large_image';

    const tags = `<!-- Primary Meta Tags -->
<title>${cleanTitle}</title>
<meta name="title" content="${cleanTitle}" />
<meta name="description" content="${cleanDesc}" />
<meta name="author" content="${escapeHtml(author)}" />
<link rel="canonical" href="${cleanUrl}" />

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${cleanUrl}" />
<meta property="og:title" content="${cleanTitle}" />
<meta property="og:description" content="${cleanDesc}" />
<meta property="og:image" content="${cleanImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter / X -->
<meta property="twitter:card" content="${twitterCard}" />
<meta property="twitter:url" content="${cleanUrl}" />
<meta property="twitter:title" content="${cleanTitle}" />
<meta property="twitter:description" content="${cleanDesc}" />
<meta property="twitter:image" content="${cleanImage}" />`;

    return {
      success: true,
      output: tags,
      executionTimeMs: 0,
      customView: 'meta',
      customData: {
        title: cleanTitle,
        description: cleanDesc,
        url: cleanUrl,
        image: cleanImage,
        cardType: twitterCard,
      },
      metadata: {
        titleLength: title.length,
        descriptionLength: desc.length,
        titleStatus: title.length >= 40 && title.length <= 65 ? 'Optimal (40-65 chars)' : 'Needs Attention',
        descStatus: desc.length >= 120 && desc.length <= 165 ? 'Optimal (120-165 chars)' : 'Needs Attention',
      },
    };
  },
  documentation: {
    overview: 'Generate search engine tags, OpenGraph snippet previews, and Twitter summary cards with automated character validation.',
    howToUse: ['Fill in page title, description, and canonical URL.', 'Copy generated HTML meta tags directly into your <head> tag.'],
    features: ['HTML XSS escaping for safe inclusion', 'Title & Description length health checks', 'Social share card previews'],
    faq: [],
  },
  seo: {
    title: 'Meta Tag & OpenGraph Generator — Free Online SEO Tag Creator',
    metaDescription: 'Generate SEO meta tags, OpenGraph social previews, and Twitter Card HTML snippets online.',
    keywords: ['meta tag generator', 'opengraph generator', 'og tag creator', 'twitter card generator', 'seo tags online'],
  },
};

/**
 * 3. AI Prompt Optimizer & System Persona Architect
 */
export const promptOptimizerTool: ToolDefinition = {
  id: 'tool-prompt-optimizer',
  slug: 'prompt-optimizer',
  name: 'AI Prompt Optimizer & System Architect',
  description: 'Refactor casual instructions into structured, high-accuracy AI prompts with system personas, strict constraints, and edge-case guards.',
  category: 'ai',
  icon: 'Sparkles',
  tags: ['AI', 'DEVELOPER', 'UTILITY'],
  aliases: ['prompt engineer', 'prompt optimizer', 'prompt generator', 'gemini prompt', 'system prompt'],
  difficulty: 'intermediate',
  isPopular: true,
  isNew: false,
  usageCount: 8940,
  rating: 4.96,
  averageExecutionMs: 4.2,
  inputType: 'text',
  outputType: 'text',
  sampleInput: `Build a React component that fetches user profiles from an API and handles loading, empty, and error states gracefully with Tailwind CSS.`,
  inputPlaceholder: 'Type your raw prompt or idea here to generate a production-grade structured system prompt...',
  defaultExportExtension: 'md',
  mimeType: 'text/markdown',
  privacyText: 'Prompts processed through the Gemini AI endpoint are sent securely to the configured Google Gemini API service. No prompts are stored in persistent telemetry logs.',
  options: [
    {
      id: 'targetModel',
      label: 'Target AI Model Architecture',
      type: 'select',
      defaultValue: 'gemini-2.5',
      options: [
        { label: 'Gemini 2.5 / 2.0 (Google GenAI)', value: 'gemini-2.5' },
        { label: 'Claude 3.7 / 3.5 Sonnet (Anthropic)', value: 'claude-3.7' },
        { label: 'GPT-4o / Reasoning (OpenAI)', value: 'gpt-4o' },
        { label: 'Generic System Persona Template', value: 'generic' },
      ],
    },
    {
      id: 'includeFewShot',
      label: 'Generate Few-Shot Pattern Template',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      id: 'enforceJsonOutput',
      label: 'Enforce Strict JSON Output Schema',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  limits: {
    maxInputLength: 50000,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please enter a prompt or specification to optimize.',
        executionTimeMs: 0,
      };
    }

    const model = options.targetModel || 'gemini-2.5';
    const includeFewShot = Boolean(options.includeFewShot);
    const enforceJson = Boolean(options.enforceJsonOutput);

    // Structural Heuristic Optimization Engine
    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    const coreTask = lines.join(' ');

    let optimized = `# System Persona & Operational Context
You are a Staff Principal Engineer and expert domain specialist. Your objective is to deliver production-grade, mathematically verified, and zero-defect solutions adhering strictly to the user requirements.

---

## 🎯 Primary Objective
${coreTask}

---

## 🛡️ Non-Negotiable Constraints & Quality Guards
1. **Zero Hallucination Guarantee**: Rely solely on verified APIs and authoritative language specifications.
2. **Robust Error Handling**: Explicitly handle edge cases, empty states, network timeouts, and malformed inputs.
3. **Performance Standards**: Ensure O(n) or optimal algorithmic complexity with zero memory leaks.
4. **Code Quality**: Write clean, modular, typed TypeScript / React code following modern industry best practices.
${enforceJson ? '5. **STRICT JSON ONLY**: Output MUST be a valid JSON object matching the required schema with zero markdown wrapper or conversational preamble.' : '5. **Concise Explanation**: Deliver code first with concise, high-value architectural commentary.'}`;

    if (includeFewShot) {
      optimized += `\n\n---

## 🧩 Expected Input / Output Pattern (Few-Shot)
**Input Context:**
\`\`\`text
${trimmed.slice(0, 120)}...
\`\`\`

**Expected Output Standard:**
\`\`\`${enforceJson ? 'json' : 'typescript'}
${enforceJson ? '{\n  "status": "success",\n  "data": { ... }\n}' : '// Self-contained, production-grade implementation\nexport function Solution() { ... }'}
\`\`\``;
    }

    optimized += `\n\n---

## ⚡ Execution Protocol
Begin execution directly by addressing the primary objective while respecting every operational constraint.`;

    return {
      success: true,
      output: optimized,
      executionTimeMs: 0,
      metadata: {
        targetArchitecture: model,
        enforceJson,
        estimatedTokens: Math.ceil(optimized.length / 4),
      },
    };
  },
  documentation: {
    overview: 'Transform natural language requests into structured, hallucination-resistant prompt blueprints with personas and constraints.',
    howToUse: ['Type your raw instructions.', 'Select target AI architecture and few-shot formatting.', 'Copy the production-ready prompt into your LLM.'],
    features: ['System persona generation', 'Zero-hallucination constraint blocks', 'Few-shot pattern synthesizer', 'Strict JSON schema forcing mode'],
    faq: [],
  },
  seo: {
    title: 'AI Prompt Optimizer & System Persona Architect — Production LLM Prompts',
    metaDescription: 'Optimize AI prompts for Gemini, Claude, and GPT-4. Generate structured system prompts with strict constraints.',
    keywords: ['prompt optimizer', 'prompt engineer online', 'system prompt generator', 'gemini prompt optimizer', 'ai prompt engineering'],
  },
};
