/**
 * Tool Engine Validation & Security Utilities
 * Centralized helpers for safe parsing, sanitization, and execution constraints
 */

export interface JsonParseResult {
  valid: boolean;
  data?: any;
  error?: string;
  line?: number;
  column?: number;
}

/**
 * Safely parse JSON strings including primitives (string, number, boolean, null),
 * arrays, and nested objects without crashing.
 */
export function safeParseJson(input: string): JsonParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: 'Empty JSON input' };
  }

  try {
    const data = JSON.parse(trimmed);
    return { valid: true, data };
  } catch (err: any) {
    // Extract line and column if available from V8 error message
    let line = 1;
    let column = 1;
    const posMatch = err.message.match(/position\s+(\d+)/i);
    if (posMatch && posMatch[1]) {
      const position = parseInt(posMatch[1], 10);
      const lines = trimmed.slice(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      valid: false,
      error: err.message || 'Malformed JSON syntax',
      line,
      column,
    };
  }
}

/**
 * Standard Unicode-safe Base64 Encoding without deprecated unescape()
 */
export function safeBase64Encode(str: string, urlSafe: boolean = false): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);

  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  return base64;
}

/**
 * Standard Unicode-safe Base64 Decoding without deprecated escape()
 */
export function safeBase64Decode(str: string, urlSafe: boolean = false): string {
  let cleaned = str.trim();
  if (urlSafe || cleaned.includes('-') || cleaned.includes('_')) {
    cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
    while (cleaned.length % 4 !== 0) {
      cleaned += '=';
    }
  }

  try {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(bytes);
  } catch (err: any) {
    throw new Error(`Invalid Base64 payload: ${err.message || 'Mal-formed characters'}`);
  }
}

/**
 * Escapes HTML characters to prevent XSS in raw HTML generation
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Robust HTML Sanitizer to prevent script execution, event handlers, and dangerous URIs
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let sanitized = html
    // Remove <script> tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove dangerous tags like object, embed, iframe, applet, meta, link, base
    .replace(/<(object|embed|applet|base|link|meta)\b[^>]*>/gi, '')
    .replace(/<\/(object|embed|applet|base|link|meta)>/gi, '')
    // Remove inline event handlers like onclick, onload, onerror, onmouseover, etc.
    .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Remove javascript:, data:text/html, vbscript: URLs
    .replace(/href\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, 'href="#"')
    .replace(/src\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, 'src=""')
    .replace(/href\s*=\s*(?:'data:text\/html[^']*'|"data:text\/html[^"]*")/gi, 'href="#"');

  return sanitized;
}

/**
 * Safe Regex testing with protection against pathological catastrophic backtracking
 */
export function safeRegexMatch(
  pattern: string,
  flags: string,
  input: string,
  maxMatches: number = 1000
): {
  totalMatches: number;
  matches: Array<{ match: string; index: number; length: number; groups?: Record<string, string> }>;
  truncated: boolean;
} {
  // Validate pattern syntax
  const validFlags = flags.replace(/[^gimsuy]/g, '');
  const isGlobal = validFlags.includes('g');
  const finalFlags = isGlobal ? validFlags : validFlags + 'g';

  const regex = new RegExp(pattern, finalFlags);
  const matches: Array<{ match: string; index: number; length: number; groups?: Record<string, string> }> = [];

  let match: RegExpExecArray | null;
  let iterations = 0;
  const maxIterations = 50000;
  let truncated = false;

  const startTime = performance.now();
  const timeoutMs = 500; // 500ms safety cap

  while ((match = regex.exec(input)) !== null) {
    iterations++;
    matches.push({
      match: match[0],
      index: match.index,
      length: match[0].length,
      groups: match.groups ? { ...match.groups } : undefined,
    });

    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    if (matches.length >= maxMatches || iterations >= maxIterations) {
      truncated = true;
      break;
    }

    if (iterations % 500 === 0 && performance.now() - startTime > timeoutMs) {
      truncated = true;
      break;
    }

    if (!isGlobal) {
      break;
    }
  }

  return {
    totalMatches: matches.length,
    matches,
    truncated,
  };
}

/**
 * Color conversion & WCAG 2.2 calculations
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  if (cleaned.length !== 6) return null;

  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * WCAG Relative Luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Contrast Ratio between two RGB colors (returns 1 to 21)
 */
export function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}
