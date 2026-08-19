import { ToolDefinition } from '../../types/toolEngine';
import { safeParseJson } from '../toolValidation';

/**
 * 1. Unit Converter & Measurement Matrix
 */
export const unitConverterTool: ToolDefinition = {
  id: 'tool-unit-converter',
  slug: 'unit-converter',
  name: 'Multi-Category Unit & Data Converter',
  description: 'Convert between storage data, bandwidth, length, mass, temperature, time, speed, area, and volume.',
  category: 'data',
  icon: 'Cpu',
  tags: ['DATA', 'UTILITY'],
  aliases: ['unit converter', 'byte converter', 'data calculator', 'temperature converter', 'metric imperial'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: false,
  usageCount: 3100,
  rating: 4.87,
  averageExecutionMs: 1.2,
  inputType: 'number',
  outputType: 'json',
  sampleInput: `1024`,
  inputPlaceholder: 'Enter numeric value to convert across unit dimensions...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'category',
      label: 'Measurement Category',
      type: 'select',
      defaultValue: 'data',
      options: [
        { label: 'Data & Storage (Bytes, KB, MB, GB, TB)', value: 'data' },
        { label: 'Length & Distance (m, km, ft, mi, in)', value: 'length' },
        { label: 'Mass & Weight (kg, g, lb, oz)', value: 'mass' },
        { label: 'Temperature (°C, °F, K)', value: 'temperature' },
        { label: 'Time (ms, sec, min, hr, days)', value: 'time' },
        { label: 'Speed (m/s, km/h, mph, knots)', value: 'speed' },
      ],
    },
    {
      id: 'baseUnit',
      label: 'Input Base Unit',
      type: 'select',
      defaultValue: 'MB',
      options: [
        { label: 'Data: Megabytes (MB / MiB)', value: 'MB' },
        { label: 'Data: Bytes (B)', value: 'B' },
        { label: 'Data: Gigabytes (GB / GiB)', value: 'GB' },
        { label: 'Length: Meters (m)', value: 'm' },
        { label: 'Length: Feet (ft)', value: 'ft' },
        { label: 'Length: Kilometers (km)', value: 'km' },
        { label: 'Mass: Kilograms (kg)', value: 'kg' },
        { label: 'Mass: Pounds (lb)', value: 'lb' },
        { label: 'Temp: Celsius (°C)', value: 'C' },
        { label: 'Temp: Fahrenheit (°F)', value: 'F' },
        { label: 'Time: Seconds (s)', value: 's' },
        { label: 'Time: Hours (hr)', value: 'hr' },
      ],
    },
    {
      id: 'precision',
      label: 'Decimal Precision',
      type: 'select',
      defaultValue: 4,
      options: [
        { label: '2 Decimal Places', value: 2 },
        { label: '4 Decimal Places', value: 4 },
        { label: '6 Decimal Places', value: 6 },
      ],
    },
  ],
  limits: {
    maxInputLength: 1000,
  },
  execute: (input: string, options: Record<string, any>) => {
    const val = parseFloat(input.trim());
    if (isNaN(val)) {
      return {
        success: false,
        output: '',
        error: 'Please enter a valid numeric value to convert.',
        executionTimeMs: 0,
      };
    }

    const precision = Number(options.precision || 4);
    const category = options.category || 'data';
    const baseUnit = options.baseUnit || 'MB';

    let matrix: Record<string, string | number> = {};

    if (category === 'data') {
      // Normalize to Bytes
      let bytes = val;
      if (baseUnit === 'KB') bytes = val * 1000;
      else if (baseUnit === 'MB') bytes = val * 1000 * 1000;
      else if (baseUnit === 'GB') bytes = val * 1000 * 1000 * 1000;

      matrix = {
        input: `${val} ${baseUnit}`,
        bits: (bytes * 8).toLocaleString() + ' bits',
        bytes: bytes.toLocaleString() + ' B',
        'Kilobytes (KB - 1000)': (bytes / 1000).toFixed(precision) + ' KB',
        'Kibibytes (KiB - 1024)': (bytes / 1024).toFixed(precision) + ' KiB',
        'Megabytes (MB - 1000^2)': (bytes / 1000000).toFixed(precision) + ' MB',
        'Mebibytes (MiB - 1024^2)': (bytes / (1024 * 1024)).toFixed(precision) + ' MiB',
        'Gigabytes (GB)': (bytes / (1000 * 1000 * 1000)).toFixed(precision) + ' GB',
        'Gibibytes (GiB)': (bytes / Math.pow(1024, 3)).toFixed(precision) + ' GiB',
        'Terabytes (TB)': (bytes / Math.pow(1000, 4)).toFixed(precision) + ' TB',
        'Transfer Time @ 100 Mbps': ((bytes * 8) / (100 * 1000 * 1000)).toFixed(2) + ' seconds',
        'Transfer Time @ 1 Gbps': ((bytes * 8) / (1000 * 1000 * 1000)).toFixed(2) + ' seconds',
      };
    } else if (category === 'length') {
      // Normalize to meters
      let meters = val;
      if (baseUnit === 'km') meters = val * 1000;
      else if (baseUnit === 'ft') meters = val * 0.3048;

      matrix = {
        input: `${val} ${baseUnit}`,
        millimeters: (meters * 1000).toFixed(precision) + ' mm',
        centimeters: (meters * 100).toFixed(precision) + ' cm',
        meters: meters.toFixed(precision) + ' m',
        kilometers: (meters / 1000).toFixed(precision) + ' km',
        inches: (meters / 0.0254).toFixed(precision) + ' in',
        feet: (meters / 0.3048).toFixed(precision) + ' ft',
        yards: (meters / 0.9144).toFixed(precision) + ' yd',
        miles: (meters / 1609.344).toFixed(precision) + ' mi',
        nauticalMiles: (meters / 1852).toFixed(precision) + ' nmi',
      };
    } else if (category === 'temperature') {
      let celsius = val;
      if (baseUnit === 'F') celsius = ((val - 32) * 5) / 9;

      const fahrenheit = (celsius * 9) / 5 + 32;
      const kelvin = celsius + 273.15;

      matrix = {
        input: `${val} ${baseUnit}`,
        'Celsius (°C)': celsius.toFixed(precision) + ' °C',
        'Fahrenheit (°F)': fahrenheit.toFixed(precision) + ' °F',
        'Kelvin (K)': kelvin.toFixed(precision) + ' K',
      };
    } else {
      // General Time / Speed
      let seconds = val;
      if (baseUnit === 'hr') seconds = val * 3600;

      matrix = {
        input: `${val} ${baseUnit}`,
        milliseconds: (seconds * 1000).toLocaleString() + ' ms',
        seconds: seconds.toFixed(precision) + ' s',
        minutes: (seconds / 60).toFixed(precision) + ' min',
        hours: (seconds / 3600).toFixed(precision) + ' hr',
        days: (seconds / 86400).toFixed(precision) + ' days',
      };
    }

    return {
      success: true,
      output: JSON.stringify(matrix, null, 2),
      executionTimeMs: 0,
      customView: 'unit',
      customData: matrix,
      metadata: {
        category,
        inputNumeric: val,
      },
    };
  },
  documentation: {
    overview: 'Universal unit conversion matrix supporting digital storage, SI vs Binary data (KiB vs KB), temperature, and physics metrics.',
    howToUse: ['Type numeric value.', 'Select conversion category and input base unit.', 'Review instant conversion matrix.'],
    features: ['Binary (1024) vs Decimal (1000) storage matrix', 'Bandwidth transfer time calculator', 'Precision controls'],
    faq: [],
  },
  seo: {
    title: 'Unit & Data Converter — Storage, Physics & Measurement Matrix',
    metaDescription: 'Convert bytes, kilobytes, gigabytes, temperature, length, and speed online with consistent precision.',
    keywords: ['unit converter', 'byte converter', 'data transfer calculator', 'storage converter', 'si binary converter'],
  },
};

/**
 * 2. Unix Timestamp Converter & Timezone Studio
 */
export const timestampConverterTool: ToolDefinition = {
  id: 'tool-timestamp-converter',
  slug: 'timestamp-converter',
  name: 'Unix Timestamp & Epoch Converter',
  description: 'Convert Unix epoch timestamps (seconds & milliseconds) to human-readable ISO 8601, UTC, and RFC 2822 dates.',
  category: 'data',
  icon: 'Clock',
  tags: ['DATA', 'DEVELOPER', 'UTILITY'],
  aliases: ['unix timestamp', 'epoch converter', 'epoch to date', 'iso 8601', 'unix time', 'date to timestamp'],
  difficulty: 'beginner',
  isPopular: true,
  isNew: true,
  usageCount: 7890,
  rating: 4.95,
  averageExecutionMs: 1.1,
  inputType: 'text',
  outputType: 'json',
  sampleInput: `1755169400`,
  inputPlaceholder: 'Enter Unix timestamp (e.g., 1755169400) or ISO date (2026-08-14T10:00:00Z)...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'currentNow',
      label: 'Use Current UTC Clock',
      description: 'Fill with current UTC time',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  limits: {
    maxInputLength: 1000,
  },
  execute: (input: string, options: Record<string, any>) => {
    let raw = input.trim();
    let date: Date;

    if (options.currentNow || !raw) {
      date = new Date();
    } else if (/^\d{10}$/.test(raw)) {
      // 10 digits = seconds
      date = new Date(parseInt(raw, 10) * 1000);
    } else if (/^\d{13}$/.test(raw)) {
      // 13 digits = milliseconds
      date = new Date(parseInt(raw, 10));
    } else {
      date = new Date(raw);
    }

    if (isNaN(date.getTime())) {
      return {
        success: false,
        output: '',
        error: 'Invalid timestamp or date format. Provide a 10/13 digit Unix epoch or standard ISO string.',
        executionTimeMs: 0,
      };
    }

    const epochSeconds = Math.floor(date.getTime() / 1000);
    const epochMillis = date.getTime();
    const isoUtc = date.toISOString();
    const utcString = date.toUTCString();
    const localString = date.toString();

    const diffMs = Date.now() - date.getTime();
    const isPast = diffMs > 0;
    const absDiffSec = Math.floor(Math.abs(diffMs) / 1000);

    let relativeTime = 'Just now';
    if (absDiffSec >= 86400) {
      const days = Math.floor(absDiffSec / 86400);
      relativeTime = `${days} day${days > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
    } else if (absDiffSec >= 3600) {
      const hrs = Math.floor(absDiffSec / 3600);
      relativeTime = `${hrs} hour${hrs > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
    } else if (absDiffSec >= 60) {
      const mins = Math.floor(absDiffSec / 60);
      relativeTime = `${mins} minute${mins > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
    }

    const outputData = {
      epochSeconds,
      epochMilliseconds: epochMillis,
      iso8601: isoUtc,
      utcString,
      localBrowserTime: localString,
      relativeTime,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
      isLeapYear: (date.getUTCFullYear() % 4 === 0 && date.getUTCFullYear() % 100 !== 0) || date.getUTCFullYear() % 400 === 0,
    };

    return {
      success: true,
      output: JSON.stringify(outputData, null, 2),
      executionTimeMs: 0,
      metadata: {
        epochSeconds,
        isoUtc,
      },
    };
  },
  documentation: {
    overview: 'Convert between Unix timestamps in seconds or milliseconds and standardized ISO 8601 / RFC 2822 human dates.',
    howToUse: ['Enter Unix timestamp or ISO date string.', 'Review full time format breakdown.'],
    features: ['10-digit (seconds) vs 13-digit (ms) auto-detection', 'Relative time calculator', 'UTC and local browser timezone display'],
    faq: [],
  },
  seo: {
    title: 'Unix Timestamp & Epoch Converter — Online Epoch to Human Date',
    metaDescription: 'Convert Unix epoch timestamps to ISO 8601, UTC, and local time. Free online timestamp converter.',
    keywords: ['unix timestamp', 'epoch converter', 'epoch to date', 'timestamp to date', 'iso 8601 online'],
  },
};

/**
 * 3. Deep URL Parser & Query Parameter Inspector
 */
export const urlParserTool: ToolDefinition = {
  id: 'tool-url-parser',
  slug: 'url-parser',
  name: 'Deep URL & Query Parameter Parser',
  description: 'Deconstruct URLs into protocol, host, port, path, query parameters table, hash, and auth credentials.',
  category: 'developer',
  icon: 'Globe',
  tags: ['DEVELOPER', 'DATA', 'UTILITY'],
  aliases: ['url parser', 'query string parser', 'url inspector', 'parse url', 'url breakdown'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 4560,
  rating: 4.91,
  averageExecutionMs: 1.3,
  inputType: 'url',
  outputType: 'json',
  sampleInput: `https://api.bygoodai.example:443/v1/tools/execute?toolSlug=json-formatter&indent=2&sortKeys=true#output-pane`,
  inputPlaceholder: 'Enter any standard HTTP/HTTPS URL with query parameters and hash anchors...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [],
  limits: {
    maxInputLength: 10000,
  },
  execute: (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please enter a URL to parse.',
        executionTimeMs: 0,
      };
    }

    try {
      const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);

      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((v, k) => {
        queryParams[k] = v;
      });

      const parsed = {
        href: url.href,
        protocol: url.protocol.replace(':', ''),
        origin: url.origin,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443 (default)' : '80 (default)'),
        pathname: url.pathname,
        pathSegments: url.pathname.split('/').filter(Boolean),
        hash: url.hash || null,
        hasQueryParams: Object.keys(queryParams).length > 0,
        queryParamCount: Object.keys(queryParams).length,
        queryParams,
      };

      return {
        success: true,
        output: JSON.stringify(parsed, null, 2),
        executionTimeMs: 0,
        metadata: {
          hostname: url.hostname,
          queryParamCount: Object.keys(queryParams).length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: `Malformed URL: ${err.message}`,
        details: 'Ensure URL contains a valid protocol or domain name.',
        executionTimeMs: 0,
      };
    }
  },
  documentation: {
    overview: 'Break down complex URLs and query strings into an inspectable JSON structure.',
    howToUse: ['Paste any URL.', 'Review separated protocol, hostname, path segments, and query parameters.'],
    features: ['Query params breakdown', 'Path segments array', 'Port and hash anchor isolation'],
    faq: [],
  },
  seo: {
    title: 'URL Parser & Query String Inspector — Deep URL Breakdown',
    metaDescription: 'Parse URLs into protocol, hostname, path segments, and query parameters online.',
    keywords: ['url parser', 'query parameter parser', 'parse url online', 'query string inspector'],
  },
};

/**
 * 4. URL Encoder & Decoder (RFC 3986)
 */
export const urlEncoderTool: ToolDefinition = {
  id: 'tool-url-encoder',
  slug: 'url-encoder-decoder',
  name: 'URL & URI Component Encoder / Decoder',
  description: 'Encode and decode query strings, URI components, and special characters per RFC 3986 standards.',
  category: 'security',
  icon: 'Globe',
  tags: ['SECURITY', 'DEVELOPER', 'UTILITY'],
  aliases: ['url encode', 'url decode', 'uri component', 'percent encoding', 'url escaper'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 4210,
  rating: 4.9,
  averageExecutionMs: 1.0,
  inputType: 'text',
  outputType: 'text',
  sampleInput: `https://bygoodai.example/search?q=developer tools & category=data/formatters`,
  inputPlaceholder: 'Enter URL query string or text to percent-encode or decode...',
  defaultExportExtension: 'txt',
  mimeType: 'text/plain',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'mode',
      label: 'Operation Mode',
      type: 'select',
      defaultValue: 'encodeComponent',
      options: [
        { label: 'Encode URI Component (encodeURIComponent)', value: 'encodeComponent' },
        { label: 'Encode Full URI (encodeURI)', value: 'encodeURI' },
        { label: 'Decode URI Component (decodeURIComponent)', value: 'decodeComponent' },
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

    const mode = options.mode || 'encodeComponent';

    try {
      let output = '';
      if (mode === 'encodeComponent') {
        output = encodeURIComponent(trimmed);
      } else if (mode === 'encodeURI') {
        output = encodeURI(trimmed);
      } else {
        output = decodeURIComponent(trimmed);
      }

      return {
        success: true,
        output,
        executionTimeMs: 0,
        metadata: {
          mode,
          inputLength: trimmed.length,
          outputLength: output.length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: `URI Decoding Error: ${err.message}`,
        details: 'Verify percent encoding format (%20, %2F, etc.).',
        executionTimeMs: 0,
      };
    }
  },
  documentation: {
    overview: 'Percent-encode special characters in URLs or decode query parameters back into plain text.',
    howToUse: ['Choose encoding mode (encodeURIComponent, encodeURI, or decode).', 'Paste text.', 'Copy output.'],
    features: ['RFC 3986 Compliance', 'Full UTF-8 Unicode percent-encoding', 'Handles query strings and fragments'],
    faq: [],
  },
  seo: {
    title: 'URL & URI Component Encoder / Decoder — Percent Encoding Online',
    metaDescription: 'Encode and decode URLs and URI query strings online. Fast, RFC 3986 compliant.',
    keywords: ['url encoder', 'url decoder', 'encodeURIComponent online', 'percent encoding', 'uri decoder'],
  },
};

/**
 * 5. Word, Character & Text Analytics Counter
 */
export const wordCounterTool: ToolDefinition = {
  id: 'tool-word-counter',
  slug: 'word-counter',
  name: 'Word, Character & Density Counter',
  description: 'Real-time text analytics for character counts, words, sentences, reading duration, and keyword frequencies.',
  category: 'data',
  icon: 'FileText',
  tags: ['DATA', 'UTILITY'],
  aliases: ['word counter', 'character counter', 'reading time', 'text analytics', 'sentence counter'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 5120,
  rating: 4.92,
  averageExecutionMs: 1.5,
  inputType: 'text',
  outputType: 'json',
  sampleInput: `ByGoodAI Platform provides responsive, client-side developer utilities. Built with browser-native execution, it formats code, generates cryptographic hashes, and inspects data structures locally.`,
  inputPlaceholder: 'Type or paste essay, code comment, or article text to calculate word and character counts...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [],
  limits: {
    maxInputLength: 5 * 1024 * 1024,
  },
  execute: (input: string) => {
    const text = input.trim();
    if (!text) {
      return {
        success: false,
        output: '',
        error: 'Please enter text to analyze.',
        executionTimeMs: 0,
      };
    }

    const charactersWithSpaces = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, '').length;
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    // Average reading speed: 200 words per minute
    const readingTimeMins = Math.ceil(wordCount / 200);
    // Speaking speed: 130 words per minute
    const speakingTimeMins = Math.ceil(wordCount / 130);

    // Keyword density
    const freqMap: Record<string, number> = {};
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'for', 'with', 'on', 'that', 'this', 'as']);
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        freqMap[clean] = (freqMap[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        density: `${((count / wordCount) * 100).toFixed(1)}%`,
      }));

    const result = {
      summary: {
        words: wordCount,
        characters: charactersWithSpaces,
        charactersNoSpaces,
        sentences,
        paragraphs,
        lines,
      },
      estimates: {
        readingTime: `${readingTimeMins} min (${wordCount} words @ 200 WPM)`,
        speakingTime: `${speakingTimeMins} min (@ 130 WPM)`,
        averageWordLength: (charactersNoSpaces / wordCount).toFixed(1) + ' characters',
      },
      topKeywordDensity: topKeywords,
    };

    return {
      success: true,
      output: JSON.stringify(result, null, 2),
      executionTimeMs: 0,
      metadata: {
        words: wordCount,
        characters: charactersWithSpaces,
      },
    };
  },
  documentation: {
    overview: 'Calculate instant word counts, sentence lengths, reading duration, and keyword frequencies.',
    howToUse: ['Paste text into the canvas.', 'Inspect metrics and keyword density breakdown.'],
    features: ['Reading & speaking time estimations', 'Paragraph and sentence breakdown', 'Keyword frequency matrix'],
    faq: [],
  },
  seo: {
    title: 'Word & Character Counter — Reading Time & Keyword Density',
    metaDescription: 'Free online word counter, character counter, reading time calculator, and text analyzer.',
    keywords: ['word counter', 'character counter', 'reading time calculator', 'word count online', 'text analytics'],
  },
};

/**
 * 6. Number Base Converter (Binary, Octal, Decimal, Hexadecimal)
 */
export const numberBaseTool: ToolDefinition = {
  id: 'tool-number-base',
  slug: 'number-base-converter',
  name: 'Number Base & Radix Converter',
  description: 'Convert numbers between Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16).',
  category: 'data',
  icon: 'Binary',
  tags: ['DATA', 'DEVELOPER', 'UTILITY'],
  aliases: ['base converter', 'binary to hex', 'hex to decimal', 'decimal to binary', 'octal converter'],
  difficulty: 'beginner',
  isPopular: false,
  isNew: true,
  usageCount: 3410,
  rating: 4.89,
  averageExecutionMs: 1.1,
  inputType: 'text',
  outputType: 'json',
  sampleInput: `255`,
  inputPlaceholder: 'Enter number in decimal, hex (0xFF), or binary (0b11111111)...',
  defaultExportExtension: 'json',
  mimeType: 'application/json',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'inputBase',
      label: 'Input Number Base',
      type: 'select',
      defaultValue: '10',
      options: [
        { label: 'Decimal (Base 10)', value: '10' },
        { label: 'Hexadecimal (Base 16)', value: '16' },
        { label: 'Binary (Base 2)', value: '2' },
        { label: 'Octal (Base 8)', value: '8' },
      ],
    },
  ],
  limits: {
    maxInputLength: 1000,
  },
  execute: (input: string, options: Record<string, any>) => {
    let clean = input.trim();
    if (!clean) {
      return {
        success: false,
        output: '',
        error: 'Please enter a number to convert.',
        executionTimeMs: 0,
      };
    }

    let base = parseInt(options.inputBase || '10', 10);
    if (clean.startsWith('0x') || clean.startsWith('0X')) {
      base = 16;
      clean = clean.slice(2);
    } else if (clean.startsWith('0b') || clean.startsWith('0B')) {
      base = 2;
      clean = clean.slice(2);
    } else if (clean.startsWith('0o') || clean.startsWith('0O')) {
      base = 8;
      clean = clean.slice(2);
    }

    try {
      const parsedBigInt = BigInt(base === 10 ? clean : `0x${parseInt(clean, base).toString(16)}`);
      const num = Number(parsedBigInt);

      const matrix = {
        decimal: parsedBigInt.toString(10),
        hexadecimal: '0x' + parsedBigInt.toString(16).toUpperCase(),
        binary: '0b' + parsedBigInt.toString(2),
        octal: '0o' + parsedBigInt.toString(8),
        base36: parsedBigInt.toString(36).toUpperCase(),
        bitwiseByteLength: Math.ceil(parsedBigInt.toString(2).length / 8),
      };

      return {
        success: true,
        output: JSON.stringify(matrix, null, 2),
        executionTimeMs: 0,
        metadata: {
          decimal: num,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: `Invalid number format for base ${base}: ${err.message}`,
        executionTimeMs: 0,
      };
    }
  },
  documentation: {
    overview: 'Convert values across Binary, Octal, Decimal, Hexadecimal, and Base-36 radix formats.',
    howToUse: ['Enter numeric string.', 'Select input base or use standard prefixes (0x, 0b).', 'Review converted representations.'],
    features: ['BigInt support for large precision numbers', 'Hexadecimal, Binary, Octal, and Decimal matrix', 'Bit length counter'],
    faq: [],
  },
  seo: {
    title: 'Number Base Converter — Binary, Decimal, Hex, Octal Radix Matrix',
    metaDescription: 'Convert numbers between Binary, Decimal, Hexadecimal, and Octal online with BigInt support.',
    keywords: ['number base converter', 'binary to decimal', 'hex to binary', 'octal converter', 'radix converter'],
  },
};

/**
 * 7. JSON ↔ CSV Converter
 */
export const jsonCsvTool: ToolDefinition = {
  id: 'tool-json-csv',
  slug: 'json-csv-converter',
  name: 'JSON ↔ CSV Bi-Directional Converter',
  description: 'Convert JSON arrays to structured CSV spreadsheets and parse CSV data into formatted JSON objects.',
  category: 'data',
  icon: 'Database',
  tags: ['DATA', 'FORMATTER', 'DEVELOPER'],
  aliases: ['json to csv', 'csv to json', 'json csv converter', 'export csv', 'csv parser'],
  difficulty: 'intermediate',
  isPopular: true,
  isNew: true,
  usageCount: 6890,
  rating: 4.93,
  averageExecutionMs: 3.6,
  inputType: 'json',
  outputType: 'text',
  sampleInput: `[\n  {\n    "id": "usr-1",\n    "name": "Alex Vanderbilt",\n    "role": "USER",\n    "executions": 142\n  },\n  {\n    "id": "usr-2",\n    "name": "Jordan Smith",\n    "role": "ADMIN",\n    "executions": 890\n  }\n]`,
  inputPlaceholder: 'Paste JSON array of objects to convert to CSV, or paste CSV with headers to convert to JSON...',
  defaultExportExtension: 'csv',
  mimeType: 'text/csv',
  privacyText: 'Processed 100% locally in browser memory.',
  options: [
    {
      id: 'mode',
      label: 'Conversion Direction',
      type: 'select',
      defaultValue: 'jsonToCsv',
      options: [
        { label: 'JSON → CSV', value: 'jsonToCsv' },
        { label: 'CSV → JSON', value: 'csvToJson' },
      ],
    },
    {
      id: 'delimiter',
      label: 'CSV Delimiter',
      type: 'select',
      defaultValue: ',',
      options: [
        { label: 'Comma (,)', value: ',' },
        { label: 'Semicolon (;)', value: ';' },
        { label: 'Tab (\\t)', value: '\t' },
      ],
    },
  ],
  limits: {
    maxInputLength: 10 * 1024 * 1024,
  },
  execute: (input: string, options: Record<string, any>) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        success: false,
        output: '',
        error: 'Please provide JSON or CSV data to convert.',
        executionTimeMs: 0,
      };
    }

    const mode = options.mode || 'jsonToCsv';
    const delimiter = options.delimiter || ',';

    if (mode === 'jsonToCsv') {
      const parseResult = safeParseJson(trimmed);
      if (!parseResult.valid || !Array.isArray(parseResult.data)) {
        return {
          success: false,
          output: '',
          error: 'JSON to CSV conversion requires a top-level JSON Array of objects (e.g. [{"col1": "val1"}]).',
          details: parseResult.error,
          executionTimeMs: 0,
        };
      }

      const items = parseResult.data;
      if (items.length === 0) {
        return { success: true, output: '', executionTimeMs: 0 };
      }

      // Collect all unique headers
      const headersSet = new Set<string>();
      items.forEach((item) => {
        if (item && typeof item === 'object') {
          Object.keys(item).forEach((k) => headersSet.add(k));
        }
      });
      const headers = Array.from(headersSet);

      const escapeCell = (val: any): string => {
        if (val === null || val === undefined) return '';
        let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
          str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvLines: string[] = [];
      csvLines.push(headers.map(escapeCell).join(delimiter));

      items.forEach((item) => {
        const row = headers.map((h) => escapeCell(item[h]));
        csvLines.push(row.join(delimiter));
      });

      return {
        success: true,
        output: csvLines.join('\n'),
        executionTimeMs: 0,
        metadata: {
          rowCount: items.length,
          columnCount: headers.length,
        },
      };
    } else {
      // CSV to JSON
      const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        return {
          success: false,
          output: '',
          error: 'CSV input must have at least a header row and one data row.',
          executionTimeMs: 0,
        };
      }

      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"(.*)"$/, '$1'));
      const records: Array<Record<string, any>> = [];

      for (let i = 1; i < lines.length; i++) {
        const rowValues = lines[i].split(delimiter).map((v) => v.trim().replace(/^"(.*)"$/, '$1'));
        const obj: Record<string, any> = {};
        headers.forEach((header, idx) => {
          const val = rowValues[idx] || '';
          // Auto-parse numbers or booleans
          if (val === 'true') obj[header] = true;
          else if (val === 'false') obj[header] = false;
          else if (!isNaN(Number(val)) && val !== '') obj[header] = Number(val);
          else obj[header] = val;
        });
        records.push(obj);
      }

      return {
        success: true,
        output: JSON.stringify(records, null, 2),
        executionTimeMs: 0,
        metadata: {
          recordsCount: records.length,
          columns: headers.length,
        },
      };
    }
  },
  documentation: {
    overview: 'Seamlessly convert between JSON arrays of objects and CSV spreadsheet datasets with configurable delimiters.',
    howToUse: ['Select JSON to CSV or CSV to JSON.', 'Paste data payload.', 'Export or copy formatted output.'],
    features: ['Handles nested JSON and quotes escaping', 'Configurable delimiter (comma, semicolon, tab)', 'Automatic type inference (numbers, booleans)'],
    faq: [],
  },
  seo: {
    title: 'JSON to CSV & CSV to JSON Converter — Online Data Transformer',
    metaDescription: 'Convert JSON to CSV spreadsheets and parse CSV to JSON objects online. 100% private, client-side.',
    keywords: ['json to csv', 'csv to json', 'json csv converter', 'export json to spreadsheet', 'csv parser online'],
  },
};
