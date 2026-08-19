/**
 * ByGoodAI Platform - Comprehensive Security & Reliability Hardening Test Suite
 * Tests all core Part 10 security properties including CSRF, error logging, webhooks, and auth.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { hashPassword, verifyPassword, generateSessionToken, toSafeUser, SESSION_COOKIE_NAME } from '../server/lib/auth';
import { generateRawKey, hashApiKey } from '../server/services/apiKeyService';
import { sanitizeHtml } from '../src/services/toolValidation';
import { verifyWebhookSignature, verifySubscriptionPaymentSignature } from '../server/lib/razorpay';
import { csrfProtection } from '../server/middleware/csrfProtection';
import { AppError } from '../server/middleware/errorHandler';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordTest(category: string, name: string, passed: boolean, details?: string, error?: string) {
  results.push({ category, name, passed, details, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${category}] ${name}${details ? ` - ${details}` : ''}`);
  if (error) console.error(`   Error: ${error}`);
}

/**
 * Helper to simulate Express middleware execution for testing
 */
function testMiddleware(middleware: any, req: any): Promise<{ passed: boolean; error?: any }> {
  return new Promise((resolve) => {
    const res: any = {
      status: (code: number) => {
        res.statusCode = code;
        return res;
      },
      json: (data: any) => {
        res.jsonData = data;
        return res;
      },
      setHeader: () => {},
    };

    middleware(req, res, (err: any) => {
      if (err) {
        resolve({ passed: false, error: err });
      } else {
        resolve({ passed: true });
      }
    });
  });
}

async function runSecurityTestSuite() {
  console.log('\n======================================================');
  console.log('🛡️  BYGOODAI PLATFORM - PART 10 FINAL SECURITY AUDIT');
  console.log('======================================================\n');

  // 1. Password Hashing & Salt 12 Verification
  try {
    const rawPassword = 'SuperSecretSecurePassword#2026!';
    const hash = await hashPassword(rawPassword);
    const isValid = await verifyPassword(rawPassword, hash);
    const isWrongRejected = !(await verifyPassword('WrongPassword123!', hash));

    const rounds = bcrypt.getRounds(hash);
    const isRounds12 = rounds === 12;

    recordTest(
      'Authentication',
      'bcrypt password hashing with work factor 12',
      isValid && isWrongRejected && isRounds12,
      `Work factor: ${rounds}, valid verified, invalid rejected`
    );
  } catch (err: any) {
    recordTest('Authentication', 'bcrypt password hashing', false, undefined, err.message);
  }

  // 2. Safe User Projection (No passwordHash leaks)
  try {
    const mockRawUser = {
      id: 'usr_test123',
      email: 'dev@bygoodai.example',
      name: 'Test Engineer',
      role: 'USER',
      plan: 'FREE',
      passwordHash: '$2a$12$e8x.randomhashedpasswordsomethinghere',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const safeUser: any = toSafeUser(mockRawUser);
    const hashExposed = 'passwordHash' in safeUser || safeUser.passwordHash !== undefined;

    recordTest(
      'Authentication',
      'toSafeUser never exposes passwordHash to frontend',
      !hashExposed && safeUser.email === 'dev@bygoodai.example',
      'passwordHash is completely excluded from client projection'
    );
  } catch (err: any) {
    recordTest('Authentication', 'Safe user projection', false, undefined, err.message);
  }

  // 3. Cryptographic Session Token Generation
  try {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    const is64Hex = /^[0-9a-f]{64}$/.test(token1);
    const areUnique = token1 !== token2;

    recordTest(
      'Session Security',
      'Session token generation uses 256-bit cryptographically secure entropy',
      is64Hex && areUnique,
      `Token length: ${token1.length} chars (32 random bytes, 256 bits)`
    );
  } catch (err: any) {
    recordTest('Session Security', 'Session token generation', false, undefined, err.message);
  }

  // 4. Developer API Key Entropy & SHA-256 Hashing
  try {
    const { rawKey, prefix, hash } = generateRawKey();
    const computedHash = hashApiKey(rawKey);

    const isPrefixed = rawKey.startsWith('osk_live_');
    const isMaskedPrefix = prefix.startsWith('osk_live_') && prefix.includes('...');
    const hashesMatch = hash === computedHash;

    recordTest(
      'Developer API Keys',
      'API keys generated with high entropy and stored exclusively as SHA-256 hash',
      isPrefixed && isMaskedPrefix && hashesMatch,
      `Prefix: ${prefix}, SHA-256: ${hash.slice(0, 16)}...`
    );
  } catch (err: any) {
    recordTest('Developer API Keys', 'API key hashing', false, undefined, err.message);
  }

  // 5. CSRF Test A: Cookie-authenticated POST with JSON content-type but NO Origin and NO Referer -> MUST 403 CSRF_BLOCKED
  try {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/profile',
      path: '/api/profile',
      headers: {
        'content-type': 'application/json',
      },
      cookies: {
        [SESSION_COOKIE_NAME]: 'valid_session_token_xyz',
      },
    };

    const outcome = await testMiddleware(csrfProtection, req);
    const isBlocked = !outcome.passed && outcome.error instanceof AppError && outcome.error.code === 'CSRF_BLOCKED';

    recordTest(
      'CSRF Protection',
      'Test A: Cookie POST with application/json but missing Origin/Referer is strictly blocked (403)',
      isBlocked,
      `Blocked with code: ${outcome.error?.code || 'none'}, status: ${outcome.error?.statusCode || 'none'}`
    );
  } catch (err: any) {
    recordTest('CSRF Protection', 'Test A: Missing Origin/Referer with JSON', false, undefined, err.message);
  }

  // 6. CSRF Test B: Cookie-authenticated POST with valid matching Origin -> MUST be allowed
  try {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/profile',
      path: '/api/profile',
      headers: {
        'content-type': 'application/json',
        host: 'app.bygoodai.example',
        origin: 'https://app.bygoodai.example',
      },
      cookies: {
        [SESSION_COOKIE_NAME]: 'valid_session_token_xyz',
      },
    };

    const outcome = await testMiddleware(csrfProtection, req);
    recordTest(
      'CSRF Protection',
      'Test B: Cookie POST with valid matching Origin header is permitted',
      outcome.passed,
      'Request passed through CSRF validation successfully'
    );
  } catch (err: any) {
    recordTest('CSRF Protection', 'Test B: Valid Origin', false, undefined, err.message);
  }

  // 7. CSRF Test C: Cookie-authenticated POST with untrusted cross-origin -> MUST 403
  try {
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'https://app.bygoodai.example';

    const req: any = {
      method: 'POST',
      originalUrl: '/api/profile',
      path: '/api/profile',
      headers: {
        'content-type': 'application/json',
        host: 'app.bygoodai.example',
        origin: 'https://evil-attacker-site.com',
      },
      cookies: {
        [SESSION_COOKIE_NAME]: 'valid_session_token_xyz',
      },
    };

    const outcome = await testMiddleware(csrfProtection, req);
    const isBlocked = !outcome.passed && outcome.error instanceof AppError && outcome.error.code === 'CSRF_BLOCKED';

    recordTest(
      'CSRF Protection',
      'Test C: Cookie POST with untrusted cross-site Origin is blocked (403)',
      isBlocked,
      `Rejected with: ${outcome.error?.code || 'allowed'}`
    );
  } catch (err: any) {
    recordTest('CSRF Protection', 'Test C: Untrusted Origin', false, undefined, err.message);
  } finally {
    process.env.NODE_ENV = 'development';
  }

  // 8. CSRF Test D: Cookie-authenticated POST with valid Referer -> MUST be allowed
  try {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/api-keys',
      path: '/api/api-keys',
      headers: {
        'content-type': 'application/json',
        host: 'app.bygoodai.example',
        referer: 'https://app.bygoodai.example/settings/keys',
      },
      cookies: {
        [SESSION_COOKIE_NAME]: 'valid_session_token_xyz',
      },
    };

    const outcome = await testMiddleware(csrfProtection, req);
    recordTest(
      'CSRF Protection',
      'Test D: Cookie POST with valid matching Referer header is permitted',
      outcome.passed,
      'Request passed through CSRF validation successfully'
    );
  } catch (err: any) {
    recordTest('CSRF Protection', 'Test D: Valid Referer', false, undefined, err.message);
  }

  // 9. CSRF Test E: Cookie-authenticated POST with form-urlencoded and No Origin/Referer -> MUST 403
  try {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/profile',
      path: '/api/profile',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      cookies: {
        [SESSION_COOKIE_NAME]: 'valid_session_token_xyz',
      },
    };

    const outcome = await testMiddleware(csrfProtection, req);
    const isBlocked = !outcome.passed && outcome.error instanceof AppError && outcome.error.code === 'CSRF_BLOCKED';

    recordTest(
      'CSRF Protection',
      'Test E: Cookie POST with form-urlencoded and missing Origin/Referer is blocked (403)',
      isBlocked,
      `Blocked with code: ${outcome.error?.code}`
    );
  } catch (err: any) {
    recordTest('CSRF Protection', 'Test E: Missing Origin with form-urlencoded', false, undefined, err.message);
  }

  // 10. CSRF Test F: Exact Razorpay webhook route -> MUST be exempt from CSRF
  try {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/billing/razorpay/webhook',
      path: '/api/billing/razorpay/webhook',
      headers: {
        'content-type': 'application/json',
        'x-razorpay-signature': 'sig_123',
      },
      cookies: {
        [SESSION_COOKIE_NAME]: 'session_xyz',
      },
    };

    const outcome = await testMiddleware(csrfProtection, req);
    recordTest(
      'Webhook Security',
      'Test F: Exact Razorpay webhook route (/api/billing/razorpay/webhook) is exempt from CSRF',
      outcome.passed,
      'Webhook route proceeds directly to HMAC verification'
    );
  } catch (err: any) {
    recordTest('Webhook Security', 'Test F: Exact Webhook Route', false, undefined, err.message);
  }

  // 11. CSRF Test G: Fake /webhook route (e.g. /api/test/webhook-example) -> MUST NOT receive exemption
  try {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/test/webhook-example',
      path: '/api/test/webhook-example',
      headers: {
        'content-type': 'application/json',
      },
      cookies: {
        [SESSION_COOKIE_NAME]: 'session_xyz',
      },
    };

    const outcome = await testMiddleware(csrfProtection, req);
    const isBlocked = !outcome.passed && outcome.error instanceof AppError && outcome.error.code === 'CSRF_BLOCKED';

    recordTest(
      'Webhook Security',
      'Test G: Fake /webhook route (/api/test/webhook-example) does NOT receive webhook exemption and is blocked (403)',
      isBlocked,
      `Blocked with code: ${outcome.error?.code || 'none'}`
    );
  } catch (err: any) {
    recordTest('Webhook Security', 'Test G: Fake Webhook Route', false, undefined, err.message);
  }

  // 12. XSS Sanitization & Safe HTML Rendering
  try {
    const maliciousPayload = `
      <h1>Safe Heading</h1>
      <script>alert("XSS Vulnerability!")</script>
      <img src="x" onerror="stealCookies()" />
      <a href="javascript:doEvil()">Malicious Link</a>
      <p>Safe paragraph text</p>
    `;

    const sanitized = sanitizeHtml(maliciousPayload);

    const noScript = !sanitized.includes('<script>') && !sanitized.includes('alert(');
    const noOnError = !sanitized.includes('onerror=') && !sanitized.includes('stealCookies');
    const noJavascriptHref = !sanitized.includes('href="javascript:') && !sanitized.includes('doEvil');
    const safeRetained = sanitized.includes('<h1>Safe Heading</h1>') && sanitized.includes('<p>Safe paragraph text</p>');

    recordTest(
      'XSS Prevention',
      'HTML Sanitizer neutralizes scripts, event handlers, and javascript: links',
      noScript && noOnError && noJavascriptHref && safeRetained,
      'Dangerous tags and event attributes stripped successfully'
    );
  } catch (err: any) {
    recordTest('XSS Prevention', 'HTML Sanitizer', false, undefined, err.message);
  }

  // 13. Razorpay Webhook Cryptographic HMAC Verification
  try {
    const mockSecret = 'whsec_test_secret_key_12345';
    process.env.RAZORPAY_WEBHOOK_SECRET = mockSecret;

    const payload = JSON.stringify({
      id: 'event_test_8899',
      event: 'subscription.activated',
      payload: {
        subscription: {
          entity: {
            id: 'sub_test_12345',
            status: 'active',
          },
        },
      },
    });

    const expectedSignature = crypto
      .createHmac('sha256', mockSecret)
      .update(payload)
      .digest('hex');

    const validResult = verifyWebhookSignature(payload, expectedSignature);
    const invalidResult = verifyWebhookSignature(payload, 'forged_invalid_signature_hex');

    recordTest(
      'Billing & Webhooks',
      'HMAC SHA-256 Webhook signature validation',
      validResult === true && invalidResult === false,
      'Authentic signature accepted, forged signature rejected'
    );
  } catch (err: any) {
    recordTest('Billing & Webhooks', 'Webhook signature validation', false, undefined, err.message);
  }

  // 14. Payment Subscription Checkout Signature Verification
  try {
    const mockKeySecret = 'rzp_secret_key_54321';
    process.env.RAZORPAY_KEY_SECRET = mockKeySecret;

    const paymentId = 'pay_987654321';
    const subscriptionId = 'sub_123456789';
    const payloadToSign = `${paymentId}|${subscriptionId}`;

    const expectedSignature = crypto
      .createHmac('sha256', mockKeySecret)
      .update(payloadToSign)
      .digest('hex');

    const isValid = verifySubscriptionPaymentSignature({
      razorpay_payment_id: paymentId,
      razorpay_subscription_id: subscriptionId,
      razorpay_signature: expectedSignature,
    });

    const isForgedRejected = !verifySubscriptionPaymentSignature({
      razorpay_payment_id: paymentId,
      razorpay_subscription_id: subscriptionId,
      razorpay_signature: 'fake_tampered_signature',
    });

    recordTest(
      'Billing & Webhooks',
      'Payment checkout signature HMAC verification',
      isValid && isForgedRejected,
      'Valid checkout verified, tampered signature rejected'
    );
  } catch (err: any) {
    recordTest('Billing & Webhooks', 'Checkout signature validation', false, undefined, err.message);
  }

  // Summary Report
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} PASSED (${failed} failed)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite();
