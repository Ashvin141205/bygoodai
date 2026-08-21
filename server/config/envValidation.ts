/**
 * ByGoodAI Platform - Production Environment Validation Module
 * Audits runtime configuration, verifies required secrets and URLs,
 * and prevents startup with unsafe configurations in production environments.
 * 
 * CRITICAL SECURITY RULE: NEVER log or expose actual secret values in error messages.
 */

export interface EnvValidationResult {
  isValid: boolean;
  environment: string;
  errors: string[];
  warnings: string[];
  summary: Record<string, 'CONFIGURED' | 'MISSING' | 'INVALID' | 'DEFAULT'>;
}

const FORBIDDEN_PRODUCTION_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'bygoodai.example',
  'example.com',
  'your-domain.example',
  'example.org',
  'example.net',
];

/**
 * Validates a production URL candidate.
 * Returns true if valid, or a descriptive error message if invalid.
 */
function validateProductionUrl(urlStr: string | undefined, varName: string): { valid: boolean; reason?: string } {
  if (!urlStr || !urlStr.trim()) {
    return { valid: false, reason: `${varName} is missing or empty` };
  }

  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, reason: `${varName} must use http:// or https:// protocol` };
    }

    const hostname = parsed.hostname.toLowerCase();
    for (const forbidden of FORBIDDEN_PRODUCTION_DOMAINS) {
      if (hostname === forbidden || hostname.endsWith(`.${forbidden}`)) {
        return {
          valid: false,
          reason: `${varName} contains forbidden placeholder/local host "${hostname}". A real production domain must be configured before launching.`,
        };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: `${varName} is not a valid URL format` };
  }
}

/**
 * Performs comprehensive audit of runtime environment variables.
 */
export function validateEnvironment(): EnvValidationResult {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];
  const summary: Record<string, 'CONFIGURED' | 'MISSING' | 'INVALID' | 'DEFAULT'> = {};

  // 1. DATABASE_URL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    summary.DATABASE_URL = 'CONFIGURED';
  } else {
    summary.DATABASE_URL = 'MISSING';
    if (isProduction) {
      errors.push('DATABASE_URL is required for production database connectivity.');
    } else {
      warnings.push('DATABASE_URL is not set. Database operations will fail.');
    }
  }

  // 2. AUTH_SECRET
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.trim()) {
    if (process.env.AUTH_SECRET.length < 32) {
      summary.AUTH_SECRET = 'INVALID';
      if (isProduction) {
        errors.push('AUTH_SECRET must be at least 32 characters long for cryptographically secure session signing.');
      } else {
        warnings.push('AUTH_SECRET is shorter than 32 characters. Consider generating a stronger secret.');
      }
    } else {
      summary.AUTH_SECRET = 'CONFIGURED';
    }
  } else {
    summary.AUTH_SECRET = 'MISSING';
    if (isProduction) {
      errors.push('AUTH_SECRET is required in production for secure user authentication.');
    } else {
      warnings.push('AUTH_SECRET is not configured in development. Using development fallback secret.');
    }
  }

  // 3. APP_URL / FRONTEND_URL
  const appUrl = process.env.APP_URL || process.env.FRONTEND_URL;
  if (appUrl) {
    const appUrlCheck = validateProductionUrl(appUrl, 'APP_URL/FRONTEND_URL');
    if (!appUrlCheck.valid) {
      summary.APP_URL = 'INVALID';
      if (isProduction) {
        errors.push(appUrlCheck.reason || 'Invalid APP_URL');
      } else {
        warnings.push(`Development APP_URL note: ${appUrlCheck.reason}`);
      }
    } else {
      summary.APP_URL = 'CONFIGURED';
    }
  } else {
    summary.APP_URL = 'MISSING';
    if (isProduction) {
      errors.push('APP_URL (or FRONTEND_URL) must be set in production to generate canonical URLs, sitemaps, and secure CORS headers.');
    } else {
      warnings.push('APP_URL is not set. Defaulting to local origin.');
    }
  }

  // 4. GEMINI_API_KEY
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    summary.GEMINI_API_KEY = 'CONFIGURED';
  } else {
    summary.GEMINI_API_KEY = 'MISSING';
    warnings.push('GEMINI_API_KEY is not set. AI tool generation and Assistant endpoints will operate in offline/fallback mode.');
  }

  // 5. RAZORPAY BILLING (Domestic INR)
  const hasRazorpayKeyId = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.trim());
  const hasRazorpaySecret = Boolean(process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.trim());
  const hasRazorpayWebhook = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET.trim());

  if (hasRazorpayKeyId && hasRazorpaySecret && hasRazorpayWebhook) {
    summary.RAZORPAY_CONFIG = 'CONFIGURED';
  } else if (hasRazorpayKeyId || hasRazorpaySecret || hasRazorpayWebhook) {
    summary.RAZORPAY_CONFIG = 'INVALID';
    warnings.push('Partial Razorpay configuration detected. RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET are all required for billing.');
  } else {
    summary.RAZORPAY_CONFIG = 'MISSING';
    warnings.push('Razorpay credentials not configured. Billing subscription checkouts will run in mock/test mode.');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    environment: env,
    errors,
    warnings,
    summary,
  };
}

/**
 * Startup validation routine called on server boot.
 * In production: logs diagnostic audit and safely throws if critical variables are missing.
 * In development: logs helpful diagnostics without blocking execution.
 */
export function validateEnvOnStartup(): EnvValidationResult {
  const result = validateEnvironment();

  console.log(`[ByGoodAI Env] Audit completed for environment: ${result.environment}`);
  console.log('[ByGoodAI Env] Configuration audit status:', JSON.stringify(result.summary, null, 2));

  if (result.warnings.length > 0) {
    console.warn(`[ByGoodAI Env] ${result.warnings.length} advisory warning(s):`);
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (!result.isValid) {
    console.error(`[ByGoodAI Env] FATAL: Production environment validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach((e) => console.error(`  - ${e}`));
    if (result.environment === 'production') {
      throw new Error(`Production environment configuration audit failed: ${result.errors.join('; ')}`);
    }
  }

  return result;
}
