import { ToolDefinition } from '../../types/toolEngine';
import { safeBase64Encode, safeBase64Decode, escapeHtml } from '../toolValidation';

/**
 * 1. JWT Token Inspector
 */
export const jwtDecoderTool: ToolDefinition = {
  id: 'tool-jwt-decoder',
  slug: 'jwt-decoder',
  name: 'JWT Token Inspector & Decoder',
  description: 'Decode JSON Web Tokens, inspect header algorithms, payload claims, and calculate expiration validity.',
  category: 'security',
  icon: 'KeyRound',
  tags: ['SECURITY', 'DEVELOPER'],
  aliases: ['jwt inspector', 'jwt parser', 'jwt decode', 'json web token', 'token decoder'],
  difficulty: 'intermediate',
  isPopular: true,
  isNew: false,
  usageCount: 9870,
  rating: 4.95,
  averageExecutionMs: 2.1,
  inputType: 'jwt',
  outputType: 'json',
  sampleInput: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMTI4OTQiLCJuYW1lIjoiQWxleCBWYW5kZXJiaWx0IiwiZW1haWwiOiJhbGV4QG9tbmlzdGFjay5kZXYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NTUxNjk0MDAsImV4cCI6MTc1Nzc2MTQwMH0.e2_sample_signature_not_verified`,
  inputPlaceholder: 'Paste encoded JWT token (header.payload.signature)...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory. No token is ever transmitted.',
  options: [],
  limits: {
    maxInputLength: 100000,
  },
  execute: (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please paste an encoded JSON Web Token (JWT).',
        executionTimeMs: 0,
      };
    }

    const parts = trimmed.split('.');
    if (parts.length < 2) {
      return {
        success: false,
        output: '',
        error: 'Invalid JWT format: A valid JSON Web Token must contain at least 2 dot-separated base64url segments (Header and Payload).',
        details: 'Expected structure: header.payload[.signature]',
        executionTimeMs: 0,
      };
    }

    try {
      // Decode Header
      const headerJson = safeBase64Decode(parts[0], true);
      const header = JSON.parse(headerJson);

      // Decode Payload
      const payloadJson = safeBase64Decode(parts[1], true);
      const payload = JSON.parse(payloadJson);

      const signature = parts[2] || null;

      // Inspect Standard Claims
      const nowSeconds = Math.floor(Date.now() / 1000);
      let isExpired: boolean | null = null;
      let timeUntilExpiry: string | null = null;
      let issuedAtDate: string | null = null;
      let expiresAtDate: string | null = null;
      let notBeforeDate: string | null = null;

      if (typeof payload.exp === 'number') {
        const expDate = new Date(payload.exp * 1000);
        expiresAtDate = expDate.toISOString();
        isExpired = nowSeconds >= payload.exp;
        const diffSeconds = payload.exp - nowSeconds;
        if (isExpired) {
          const pastMins = Math.floor(Math.abs(diffSeconds) / 60);
          timeUntilExpiry = `Expired ${pastMins} minutes ago (${expiresAtDate})`;
        } else {
          const futureMins = Math.floor(diffSeconds / 60);
          timeUntilExpiry = `Valid for next ${futureMins} minutes (${expiresAtDate})`;
        }
      }

      if (typeof payload.iat === 'number') {
        issuedAtDate = new Date(payload.iat * 1000).toISOString();
      }

      if (typeof payload.nbf === 'number') {
        notBeforeDate = new Date(payload.nbf * 1000).toISOString();
      }

      const formattedResult = {
        disclaimer: 'IMPORTANT NOTICE: Decoding a JWT locally does NOT verify its cryptographic signature.',
        algorithm: header.alg || 'Unknown',
        tokenType: header.typ || 'JWT',
        claimsSummary: {
          subject: payload.sub || null,
          issuer: payload.iss || null,
          audience: payload.aud || null,
          isExpired,
          expiresAt: expiresAtDate,
          issuedAt: issuedAtDate,
          notBefore: notBeforeDate,
          statusNote: timeUntilExpiry,
        },
        header,
        payload,
        signature: signature
          ? {
              rawSignatureBase64Url: signature,
              lengthBytes: signature.length,
              verified: false,
              verificationNote: 'Client decoder does not have your server secret key. Signature is displayed raw.',
            }
          : null,
      };

      return {
        success: true,
        output: JSON.stringify(formattedResult, null, 2),
        executionTimeMs: 0,
        customView: 'jwt',
        customData: formattedResult,
        metadata: {
          alg: header.alg,
          isExpired,
          hasSignature: Boolean(signature),
        },
        warnings: [
          'Decoding a JWT does NOT verify its signature. Never trust unverified client-side claims for authentication.',
        ],
      };
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: `JWT Parsing Failure: ${err.message}`,
        details: 'Ensure all parts are valid Base64URL-encoded UTF-8 JSON payloads.',
        executionTimeMs: 0,
      };
    }
  },
  documentation: {
    overview: 'Inspect JSON Web Token headers, payload claims, and expiration timestamps safely in your local browser.',
    howToUse: [
      'Paste your standard 3-part Base64URL JWT string into the input canvas.',
      'Review decoded header algorithm details and standard claims (sub, exp, iat, role).',
      'Check the real-time expiration timer against UTC clock.',
    ],
    features: [
      'Full Unicode and UTF-8 claim decoding',
      'Prominent signature verification warning',
      'Automatic epoch timestamp conversion to UTC ISO 8601',
      'Signature section isolation',
    ],
    faq: [
      {
        question: 'Does decoding verify that the token is genuine?',
        answer: 'No. Decoding only reads the payload. Signature verification requires the secret key or public certificate and should be performed on your backend.',
      },
    ],
  },
  seo: {
    title: 'JWT Decoder & Token Inspector — Decode JSON Web Tokens Online',
    metaDescription: 'Decode and inspect JWT headers, claims, and expiration status in your browser. Processed locally in your browser.',
    keywords: ['jwt decoder', 'decode jwt', 'jwt parser', 'json web token online', 'inspect jwt claims'],
  },
};

/**
 * 2. Base64 Converter & URL Safe Encoder
 */
export const base64Tool: ToolDefinition = {
  id: 'tool-base64-converter',
  slug: 'base64-converter',
  name: 'Base64 & URL Encoder / Decoder',
  description: 'Encode and decode standard and URL-safe Base64 strings with full UTF-8 multibyte Unicode support.',
  category: 'security',
  icon: 'Binary',
  tags: ['SECURITY', 'UTILITY'],
  aliases: ['base64 encoder', 'base64 decode', 'base64url', 'btoa', 'atob', 'utf8 base64'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: false,
  usageCount: 8430,
  rating: 4.89,
  averageExecutionMs: 1.4,
  inputType: 'base64',
  outputType: 'text',
  sampleInput: `ByGoodAI Developer Suite: High-performance Unicode 🚀 & Emoji ⚡ support!`,
  inputPlaceholder: 'Enter plain text to encode or Base64 string to decode...',
  defaultExportExtension: 'txt',
  mimeType: 'text/plain',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'mode',
      label: 'Operation Mode',
      type: 'select',
      defaultValue: 'encode',
      options: [
        { label: 'Encode to Base64', value: 'encode' },
        { label: 'Decode from Base64', value: 'decode' },
      ],
    },
    {
      id: 'urlSafe',
      label: 'URL-Safe Characters (- and _ without padding)',
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
        error: 'Please provide text to encode or decode.',
        executionTimeMs: 0,
      };
    }

    const mode = options.mode || 'encode';
    const urlSafe = Boolean(options.urlSafe);

    try {
      if (mode === 'encode') {
        const encoded = safeBase64Encode(trimmed, urlSafe);
        return {
          success: true,
          output: encoded,
          executionTimeMs: 0,
          metadata: {
            mode: 'encode',
            inputChars: trimmed.length,
            outputChars: encoded.length,
            urlSafe,
          },
        };
      } else {
        const decoded = safeBase64Decode(trimmed, urlSafe);
        return {
          success: true,
          output: decoded,
          executionTimeMs: 0,
          metadata: {
            mode: 'decode',
            inputChars: trimmed.length,
            outputChars: decoded.length,
          },
        };
      }
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: `Base64 Processing Error: ${err.message}`,
        details: mode === 'decode' ? 'Ensure input is a valid Base64 string without corrupted characters.' : undefined,
        executionTimeMs: 0,
      };
    }
  },
  documentation: {
    overview: 'Encode and decode Base64 and URL-Safe Base64 strings with full UTF-8 Unicode encoding.',
    howToUse: ['Choose Encode or Decode.', 'Optionally toggle URL-Safe mode.', 'Copy or export transformed string.'],
    features: ['Modern TextEncoder / TextDecoder UTF-8 pipeline', 'URL-Safe RFC 4648 Base64URL support', 'No deprecated unescape/escape calls'],
    faq: [],
  },
  seo: {
    title: 'Base64 & URL Encoder / Decoder — UTF-8 Safe Online Tool',
    metaDescription: 'Encode and decode Base64 text with full UTF-8 Unicode and URL-Safe Base64URL support.',
    keywords: ['base64 encoder', 'base64 decoder', 'base64 online', 'url safe base64', 'utf8 base64'],
  },
};

/**
 * 3. Cryptographic Hash Generator
 */
export const hashGeneratorTool: ToolDefinition = {
  id: 'tool-hash-generator',
  slug: 'hash-generator',
  name: 'Cryptographic Hash Generator',
  description: 'Compute cryptographic checksums (SHA-256, SHA-384, SHA-512, SHA-1) using the standard W3C Web Crypto API.',
  category: 'security',
  icon: 'Fingerprint',
  tags: ['SECURITY', 'DEVELOPER'],
  aliases: ['sha256', 'sha512', 'sha384', 'hash generator', 'sha1', 'checksum calculator'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: false,
  usageCount: 7120,
  rating: 4.91,
  averageExecutionMs: 2.8,
  inputType: 'text',
  outputType: 'json',
  sampleInput: `The quick brown fox jumps over the lazy dog`,
  inputPlaceholder: 'Type or paste input payload to compute cryptographic hashes...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Computed 100% locally using standard Web Crypto hardware acceleration.',
  options: [
    {
      id: 'outputFormat',
      label: 'Hash Encoding Format',
      type: 'select',
      defaultValue: 'hex',
      options: [
        { label: 'Hexadecimal (Lowercase)', value: 'hex' },
        { label: 'Hexadecimal (Uppercase)', value: 'hex_upper' },
        { label: 'Base64', value: 'base64' },
      ],
    },
  ],
  limits: {
    maxInputLength: 10 * 1024 * 1024,
  },
  execute: async (input: string, options: Record<string, any>) => {
    const trimmed = input;
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please enter text or payload to compute cryptographic hashes.',
        executionTimeMs: 0,
      };
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(trimmed);
    const format = options.outputFormat || 'hex';

    const bufferToFormatted = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      if (format === 'base64') {
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return format === 'hex_upper' ? hex.toUpperCase() : hex;
    };

    // Calculate standard Web Crypto digests
    const [sha256Buf, sha384Buf, sha512Buf, sha1Buf] = await Promise.all([
      crypto.subtle.digest('SHA-256', data),
      crypto.subtle.digest('SHA-384', data),
      crypto.subtle.digest('SHA-512', data),
      crypto.subtle.digest('SHA-1', data),
    ]);

    const result = {
      inputLengthBytes: data.byteLength,
      encoding: format,
      'SHA-256': bufferToFormatted(sha256Buf),
      'SHA-384': bufferToFormatted(sha384Buf),
      'SHA-512': bufferToFormatted(sha512Buf),
      'SHA-1': bufferToFormatted(sha1Buf),
      standardUUIDv4: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'Available in modern secure context',
    };

    return {
      success: true,
      output: JSON.stringify(result, null, 2),
      executionTimeMs: 0,
      metadata: {
        sha256: result['SHA-256'],
        byteLength: data.byteLength,
      },
    };
  },
  documentation: {
    overview: 'Calculate secure one-way cryptographic checksums using native browser Web Crypto API.',
    howToUse: ['Type or paste any input payload.', 'Select Hex or Base64 encoding.', 'Copy calculated SHA-256 or SHA-512 hashes.'],
    features: ['Hardware-accelerated W3C Web Crypto digests', 'SHA-256, SHA-384, SHA-512, SHA-1', 'Standard crypto.randomUUID() generator'],
    faq: [
      {
        question: 'Why is MD5 not generated by Web Crypto?',
        answer: 'MD5 is cryptographically broken and intentionally omitted from the standard Web Crypto API. For secure hashing, always use SHA-256 or SHA-512.',
      },
    ],
  },
  seo: {
    title: 'Cryptographic Hash Generator — SHA-256, SHA-512 Web Crypto Tool',
    metaDescription: 'Calculate SHA-256, SHA-384, SHA-512, and SHA-1 hashes online using native Web Crypto API.',
    keywords: ['hash generator', 'sha256 online', 'sha512 generator', 'web crypto hash', 'checksum generator'],
  },
};

/**
 * 4. UUID Batch Generator
 */
export const uuidGeneratorTool: ToolDefinition = {
  id: 'tool-uuid-generator',
  slug: 'uuid-generator',
  name: 'UUID v4 & Unique ID Generator',
  description: 'Generate cryptographically random UUID v4 identifiers in bulk with custom casing, hyphens, and quotes.',
  category: 'security',
  icon: 'Fingerprint',
  tags: ['SECURITY', 'DEVELOPER', 'UTILITY'],
  aliases: ['uuid v4', 'guid generator', 'random uuid', 'unique id generator', 'batch uuid'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 6140,
  rating: 4.94,
  averageExecutionMs: 1.8,
  inputType: 'number',
  outputType: 'text',
  sampleInput: `5`,
  inputPlaceholder: 'Enter number of UUIDs to generate (1 to 500)...',
  defaultExportExtension: 'txt',
  mimeType: 'text/plain',
  privacyText: 'Generated 100% locally using crypto.randomUUID().',
  options: [
    {
      id: 'count',
      label: 'Batch Count',
      type: 'number',
      defaultValue: 5,
      validation: { min: 1, max: 500 },
      placeholder: '5',
    },
    {
      id: 'uppercase',
      label: 'Uppercase Letters',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      id: 'hyphens',
      label: 'Include Hyphens',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      id: 'format',
      label: 'Array / Object Wrapper',
      type: 'select',
      defaultValue: 'lines',
      options: [
        { label: 'One per line', value: 'lines' },
        { label: 'JSON Array ["..."]', value: 'json' },
        { label: 'Comma Separated', value: 'csv' },
      ],
    },
  ],
  limits: {
    maxInputLength: 1000,
  },
  execute: (input: string, options: Record<string, any>) => {
    let count = parseInt(input.trim(), 10);
    if (isNaN(count) || count < 1) {
      count = parseInt(options.count, 10) || 5;
    }
    count = Math.max(1, Math.min(500, count));

    const uppercase = Boolean(options.uppercase);
    const hyphens = options.hyphens !== false;
    const format = options.format || 'lines';

    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      if (!hyphens) {
        id = id.replace(/-/g, '');
      }
      if (uppercase) {
        id = id.toUpperCase();
      }
      uuids.push(id);
    }

    let output = '';
    if (format === 'json') {
      output = JSON.stringify(uuids, null, 2);
    } else if (format === 'csv') {
      output = uuids.join(', ');
    } else {
      output = uuids.join('\n');
    }

    return {
      success: true,
      output,
      executionTimeMs: 0,
      metadata: {
        count: uuids.length,
        version: 'v4 (Cryptographically Random)',
      },
    };
  },
  documentation: {
    overview: 'Generate cryptographically strong UUID version 4 identifiers using the standard Web Cryptography API.',
    howToUse: ['Specify desired number of UUIDs.', 'Configure hyphens and casing.', 'Export or copy batch IDs.'],
    features: ['Uses native crypto.randomUUID()', 'Bulk generation up to 500 IDs', 'JSON array & line-separated formats'],
    faq: [],
  },
  seo: {
    title: 'UUID v4 & GUID Generator — Bulk Random Unique IDs',
    metaDescription: 'Generate cryptographically random UUID v4 identifiers in bulk. Free, fast online GUID generator.',
    keywords: ['uuid generator', 'uuid v4', 'guid generator online', 'bulk uuid', 'random unique id'],
  },
};

/**
 * 5. HTML Entity Encoder / Decoder
 */
export const htmlEntityTool: ToolDefinition = {
  id: 'tool-html-entity',
  slug: 'html-entity-encoder',
  name: 'HTML Entity Encoder & Decoder',
  description: 'Convert special characters to named and numeric HTML entities (&amp;, &lt;, &gt;, &#39;) to prevent injection.',
  category: 'security',
  icon: 'Code2',
  tags: ['SECURITY', 'DEVELOPER'],
  aliases: ['html entity', 'encode html entities', 'decode html entities', 'html escape', 'html unescape'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 2980,
  rating: 4.88,
  averageExecutionMs: 1.2,
  inputType: 'text',
  outputType: 'text',
  sampleInput: `<script>alert("XSS & SQL Injection test: 5 < 10 && 'hello' === \\"world\\"")</script>`,
  inputPlaceholder: 'Enter text or HTML to encode or decode entities...',
  defaultExportExtension: 'txt',
  mimeType: 'text/plain',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'encode',
      options: [
        { label: 'Encode to HTML Entities', value: 'encode' },
        { label: 'Decode from HTML Entities', value: 'decode' },
      ],
    },
    {
      id: 'entityType',
      label: 'Entity Format (Encode Mode)',
      type: 'select',
      defaultValue: 'named',
      options: [
        { label: 'Named Entities (&lt;, &gt;, &amp;)', value: 'named' },
        { label: 'Decimal Entities (&#60;, &#62;, &#38;)', value: 'decimal' },
        { label: 'Hexadecimal Entities (&#x3C;, &#x3E;)', value: 'hex' },
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
        error: 'Please enter text to encode or decode.',
        executionTimeMs: 0,
      };
    }

    const mode = options.mode || 'encode';
    const entityType = options.entityType || 'named';

    if (mode === 'encode') {
      let encoded = '';
      if (entityType === 'named') {
        encoded = escapeHtml(trimmed);
      } else if (entityType === 'decimal') {
        encoded = trimmed
          .split('')
          .map((c) => (/[a-zA-Z0-9\s]/.test(c) ? c : `&#${c.charCodeAt(0)};`))
          .join('');
      } else {
        encoded = trimmed
          .split('')
          .map((c) => (/[a-zA-Z0-9\s]/.test(c) ? c : `&#x${c.charCodeAt(0).toString(16).toUpperCase()};`))
          .join('');
      }

      return {
        success: true,
        output: encoded,
        executionTimeMs: 0,
        metadata: {
          originalLength: trimmed.length,
          encodedLength: encoded.length,
        },
      };
    } else {
      // Decode HTML entities
      const decoded = trimmed
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

      return {
        success: true,
        output: decoded,
        executionTimeMs: 0,
      };
    }
  },
  documentation: {
    overview: 'Safely escape characters for HTML contexts or decode escaped entities back to raw text.',
    howToUse: ['Choose Encode or Decode.', 'Select entity format (named, decimal, hex).', 'Export escaped string.'],
    features: ['Prevents XSS injections', 'Named, Decimal, and Hexadecimal encoding modes', 'Robust entity decoding'],
    faq: [],
  },
  seo: {
    title: 'HTML Entity Encoder & Decoder — Free Online Entity Converter',
    metaDescription: 'Encode and decode HTML special characters and named entities to prevent XSS and markup breakage.',
    keywords: ['html entity encoder', 'html escape online', 'html entities decoder', 'escape html special characters'],
  },
};
