/**
 * ByGoodAI Server - Razorpay SDK Manager & Billing Client
 * Server-only Razorpay client with lazy initialization, secure signature verification, and plan helpers.
 * Supports domestic (India) and global (International) payments through a unified Razorpay gateway.
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { SubscriptionStatus } from '@prisma/client';

let razorpayClient: Razorpay | null = null;

/**
 * Returns true if Razorpay credentials are fully configured in the runtime environment
 */
export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return Boolean(keyId && keySecret && keyId.length > 0 && keySecret.length > 0);
}

/**
 * Returns lazy-initialized Razorpay instance or throws a clear AppError if missing.
 */
export function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      throw new AppError(
        'Razorpay billing is not configured on this server. RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for payment operations.',
        503,
        'BILLING_NOT_CONFIGURED'
      );
    }

    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}

/**
 * Returns the public Razorpay Key ID for client checkout initialization
 */
export function getRazorpayKeyId(): string | undefined {
  return process.env.RAZORPAY_KEY_ID?.trim() || undefined;
}

/**
 * Returns the configured Razorpay Plan ID for domestic PRO tier (INR)
 */
export function getRazorpayProPlanId(): string | undefined {
  return process.env.RAZORPAY_PRO_PLAN_ID?.trim() || undefined;
}

/**
 * Returns the configured Razorpay Plan ID for domestic ENTERPRISE tier (INR)
 */
export function getRazorpayEnterprisePlanId(): string | undefined {
  return process.env.RAZORPAY_ENTERPRISE_PLAN_ID?.trim() || undefined;
}

/**
 * Returns configured Razorpay Plan ID for global/international PRO tier (if configured)
 */
export function getRazorpayGlobalProPlanId(): string | undefined {
  return process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID?.trim() || undefined;
}

/**
 * Returns configured Razorpay Plan ID for global/international ENTERPRISE tier (if configured)
 */
export function getRazorpayGlobalEnterprisePlanId(): string | undefined {
  return process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID?.trim() || undefined;
}

/**
 * Returns configured global billing currency (e.g. 'USD', 'EUR') or undefined if not set
 */
export function getRazorpayGlobalCurrency(): string | undefined {
  return process.env.RAZORPAY_GLOBAL_CURRENCY?.trim() || undefined;
}

/**
 * Returns true if international payments flag is explicitly enabled in environment
 */
export function isRazorpayInternationalEnabled(): boolean {
  return process.env.RAZORPAY_INTERNATIONAL_ENABLED?.trim()?.toLowerCase() === 'true';
}

/**
 * Returns true ONLY if international payments flag is enabled AND all global configuration exists:
 * RAZORPAY_GLOBAL_CURRENCY, RAZORPAY_GLOBAL_PRO_PLAN_ID, and RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID
 */
export function isRazorpayGlobalBillingConfigured(): boolean {
  return (
    isRazorpayInternationalEnabled() &&
    Boolean(getRazorpayGlobalCurrency()) &&
    Boolean(getRazorpayGlobalProPlanId()) &&
    Boolean(getRazorpayGlobalEnterprisePlanId())
  );
}

/**
 * Checks if the configured Key ID is in Razorpay test mode (rzp_test_...)
 */
export function isRazorpayTestMode(): boolean {
  const keyId = getRazorpayKeyId();
  return Boolean(keyId && keyId.startsWith('rzp_test_'));
}

/**
 * Returns Razorpay webhook signing secret
 */
export function getRazorpayWebhookSecret(): string | undefined {
  return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || undefined;
}

/**
 * Maps Razorpay subscription status string to Prisma SubscriptionStatus enum
 */
export function mapRazorpayStatusToInternal(rzpStatus: string): SubscriptionStatus {
  switch (rzpStatus?.toLowerCase()) {
    case 'authenticated':
      return SubscriptionStatus.AUTHENTICATED;
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'pending':
      return SubscriptionStatus.PENDING;
    case 'halted':
      return SubscriptionStatus.HALTED;
    case 'cancelled':
      return SubscriptionStatus.CANCELLED;
    case 'completed':
      return SubscriptionStatus.COMPLETED;
    case 'expired':
      return SubscriptionStatus.EXPIRED;
    case 'paused':
      return SubscriptionStatus.PAUSED;
    case 'created':
    default:
      return SubscriptionStatus.CREATED;
  }
}

/**
 * Verifies Razorpay Subscription payment signature from frontend checkout callback
 * Formula: HMAC_SHA256(razorpay_payment_id + "|" + razorpay_subscription_id, secret) == razorpay_signature
 */
export function verifySubscriptionPaymentSignature(params: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) return false;

  const payload = `${params.razorpay_payment_id}|${params.razorpay_subscription_id}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(params.razorpay_signature, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature using RAZORPAY_WEBHOOK_SECRET and raw body
 * Formula: HMAC_SHA256(rawBody, webhookSecret) == x-razorpay-signature
 */
export function verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
  const webhookSecret = getRazorpayWebhookSecret();
  if (!webhookSecret) return false;

  const bodyBuffer = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(bodyBuffer)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch {
    return false;
  }
}
