/**
 * ByGoodAI Server - Razorpay Billing & Subscription Service
 * Centralized service managing Razorpay subscriptions, payment verification,
 * webhooks, idempotency, multi-currency data modeling, and PostgreSQL state synchronization.
 * Supports unified Razorpay architecture for India and Global customers with Google Pay integration.
 */

import { prisma } from '../lib/prisma';
import {
  getRazorpay,
  isRazorpayConfigured,
  getRazorpayKeyId,
  getRazorpayProPlanId,
  getRazorpayEnterprisePlanId,
  getRazorpayGlobalProPlanId,
  getRazorpayGlobalEnterprisePlanId,
  getRazorpayGlobalCurrency,
  isRazorpayInternationalEnabled,
  isRazorpayGlobalBillingConfigured,
  isRazorpayTestMode,
  mapRazorpayStatusToInternal,
  verifySubscriptionPaymentSignature,
  verifyWebhookSignature,
} from '../lib/razorpay';
import { AppError } from '../middleware/errorHandler';
import { UserPlan, SubscriptionStatus } from '@prisma/client';
import { PLAN_LIMITS } from '../config/usageLimits';

export interface BillingConfigResponse {
  isConfigured: boolean;
  keyId: string | null;
  razorpayTestMode: boolean;
  currency: string;
  availablePaymentMethods: {
    domestic: string[];
    international: string[];
  };
  googlePay: {
    status: 'AVAILABLE_VIA_RAZORPAY_WHERE_SUPPORTED' | 'CONFIGURATION_REQUIRED';
    integration: string;
    description: string;
  };
  supportedBillingRegions: string[];
  india: {
    configured: boolean;
    currency: 'INR';
    proPlanConfigured: boolean;
    enterprisePlanConfigured: boolean;
  };
  global: {
    configured: boolean;
    enabled: boolean;
    currency: string | null;
    proPlanConfigured: boolean;
    enterprisePlanConfigured: boolean;
    status: 'CONFIGURED' | 'CONFIGURATION REQUIRED';
    message: string;
  };
  international: {
    status: 'CONFIGURED' | 'CONFIGURATION REQUIRED';
    enabled: boolean;
    currency: string | null;
    pricingConfigured: boolean;
    message: string;
  };
  plans: {
    free: {
      name: string;
      priceMonthly: number;
      priceAnnual: number | null;
      currency: string;
      limits: (typeof PLAN_LIMITS)['FREE'];
    };
    pro: {
      name: string;
      priceMonthly: number;
      priceAnnual: number | null;
      currency: string;
      planIdConfigured: boolean;
      limits: (typeof PLAN_LIMITS)['PRO'];
    };
    enterprise: {
      name: string;
      priceMonthly: number;
      priceAnnual: number | null;
      currency: string;
      planIdConfigured: boolean;
      limits: (typeof PLAN_LIMITS)['ENTERPRISE'];
    };
  };
}

export interface UserSubscriptionResponse {
  plan: UserPlan;
  status: SubscriptionStatus;
  razorpaySubscriptionId: string | null;
  razorpayCustomerId: string | null;
  razorpayPlanId: string | null;
  currency: string;
  amount: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  chargeAt: string | null;
  totalCount: number | null;
  paidCount: number;
  remainingCount: number | null;
  cancelledAt: string | null;
  provider: 'RAZORPAY';
}

export interface ReadinessCheckReport {
  razorpay: 'CONFIGURED' | 'NOT CONFIGURED';
  internationalPayments: 'CONFIGURED' | 'CONFIGURATION REQUIRED';
  googlePay: 'AVAILABLE VIA RAZORPAY WHERE SUPPORTED' | 'CONFIGURATION REQUIRED';
  globalCurrency: 'CONFIGURED' | 'NOT CONFIGURED';
  globalBilling: 'CONFIGURED' | 'CONFIGURATION REQUIRED';
  testMode: boolean;
  keyIdConfigured: boolean;
  webhookConfigured: boolean;
  proPlanConfigured: boolean;
  enterprisePlanConfigured: boolean;
  globalProPlanConfigured: boolean;
  globalEnterprisePlanConfigured: boolean;
}

export class BillingService {
  /**
   * Returns public billing configuration, supported plans, limits, and Razorpay readiness
   */
  async getBillingConfig(): Promise<BillingConfigResponse> {
    const isConfigured = isRazorpayConfigured();
    const keyId = getRazorpayKeyId() || null;
    const testMode = isRazorpayTestMode();
    const proPlanId = getRazorpayProPlanId();
    const entPlanId = getRazorpayEnterprisePlanId();
    const isIntlEnabled = isRazorpayInternationalEnabled();
    const isGlobalConfigured = isRazorpayGlobalBillingConfigured();
    const intlCurrency = getRazorpayGlobalCurrency() || null;
    const globalProPlanId = getRazorpayGlobalProPlanId();
    const globalEnterprisePlanId = getRazorpayGlobalEnterprisePlanId();

    const indiaConfigured = isConfigured && Boolean(proPlanId) && Boolean(entPlanId);

    return {
      isConfigured,
      keyId,
      razorpayTestMode: testMode,
      currency: 'INR',
      availablePaymentMethods: {
        domestic: ['UPI', 'Google Pay', 'Cards', 'NetBanking', 'Wallets'],
        international: ['International Cards', 'Google Pay (where supported by Razorpay)', 'Apple Pay (where supported by Razorpay)'],
      },
      googlePay: {
        status: isConfigured ? 'AVAILABLE_VIA_RAZORPAY_WHERE_SUPPORTED' : 'CONFIGURATION_REQUIRED',
        integration: 'RAZORPAY_STANDARD_CHECKOUT',
        description: 'Google Pay is handled securely within Razorpay Checkout based on device & payment eligibility',
      },
      supportedBillingRegions: ['IN', 'GLOBAL'],
      india: {
        configured: indiaConfigured,
        currency: 'INR',
        proPlanConfigured: Boolean(proPlanId),
        enterprisePlanConfigured: Boolean(entPlanId),
      },
      global: {
        configured: isGlobalConfigured,
        enabled: isIntlEnabled,
        currency: intlCurrency,
        proPlanConfigured: Boolean(globalProPlanId),
        enterprisePlanConfigured: Boolean(globalEnterprisePlanId),
        status: isGlobalConfigured ? 'CONFIGURED' : 'CONFIGURATION REQUIRED',
        message: isGlobalConfigured
          ? 'International payments enabled and configured via Razorpay'
          : 'International pricing is being configured. India billing active in INR.',
      },
      international: {
        status: isGlobalConfigured ? 'CONFIGURED' : 'CONFIGURATION REQUIRED',
        enabled: isIntlEnabled,
        currency: intlCurrency,
        pricingConfigured: Boolean(globalProPlanId && globalEnterprisePlanId && intlCurrency),
        message: isGlobalConfigured
          ? 'International payments enabled via Razorpay'
          : 'International pricing is being configured. India billing active in INR.',
      },
      plans: {
        free: {
          name: 'Community Free',
          priceMonthly: 0,
          priceAnnual: null,
          currency: 'INR',
          limits: PLAN_LIMITS.FREE,
        },
        pro: {
          name: 'Developer Pro',
          priceMonthly: 199,
          priceAnnual: null,
          currency: 'INR',
          planIdConfigured: Boolean(proPlanId),
          limits: PLAN_LIMITS.PRO,
        },
        enterprise: {
          name: 'Enterprise',
          priceMonthly: 999,
          priceAnnual: null,
          currency: 'INR',
          planIdConfigured: Boolean(entPlanId),
          limits: PLAN_LIMITS.ENTERPRISE,
        },
      },
    };
  }

  /**
   * Retrieves the current user's authoritative billing and subscription status from PostgreSQL
   */
  async getUserSubscription(userId: string): Promise<UserSubscriptionResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.subscription) {
      return {
        plan: user.plan,
        status: SubscriptionStatus.CREATED,
        razorpaySubscriptionId: null,
        razorpayCustomerId: user.razorpayCustomerId || null,
        razorpayPlanId: null,
        currency: 'INR',
        amount: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        chargeAt: null,
        totalCount: null,
        paidCount: 0,
        remainingCount: null,
        cancelledAt: null,
        provider: 'RAZORPAY',
      };
    }

    const sub = user.subscription;

    return {
      plan: user.plan,
      status: sub.status,
      razorpaySubscriptionId: sub.razorpaySubscriptionId,
      razorpayCustomerId: sub.razorpayCustomerId || user.razorpayCustomerId || null,
      razorpayPlanId: sub.razorpayPlanId,
      currency: sub.currency || 'INR',
      amount: sub.amount || null,
      currentPeriodStart: sub.currentPeriodStart ? sub.currentPeriodStart.toISOString() : null,
      currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
      chargeAt: sub.chargeAt ? sub.chargeAt.toISOString() : null,
      totalCount: sub.totalCount,
      paidCount: sub.paidCount,
      remainingCount: sub.remainingCount,
      cancelledAt: sub.cancelledAt ? sub.cancelledAt.toISOString() : null,
      provider: 'RAZORPAY',
    };
  }

  /**
   * Creates a Razorpay Subscription on the server and returns safe frontend checkout data.
   * Plan mapping, currency, and pricing are strictly server-authoritative.
   */
  async createSubscription(params: { userId: string; plan: 'PRO' | 'ENTERPRISE'; totalCount?: number }) {
    if (!isRazorpayConfigured()) {
      throw new AppError(
        'Razorpay billing is not configured on this server. Please provide RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
        503,
        'BILLING_NOT_CONFIGURED'
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { subscription: true, profile: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Determine region server-side from Profile (not directly mutable by checkout body)
    const userCountry = (user.profile?.billingCountry?.trim() || 'IN').toUpperCase();
    const isDomestic = userCountry === 'IN';

    // Map plan server-side
    let planId: string | undefined;
    let targetPlan: UserPlan = UserPlan.PRO;
    let currency = 'INR';
    let amountInMinor = params.plan === 'PRO' ? 19900 : 99900;

    if (isDomestic) {
      currency = 'INR';
      if (params.plan === 'PRO') {
        planId = getRazorpayProPlanId();
        targetPlan = UserPlan.PRO;
        amountInMinor = 19900;
      } else if (params.plan === 'ENTERPRISE') {
        planId = getRazorpayEnterprisePlanId();
        targetPlan = UserPlan.ENTERPRISE;
        amountInMinor = 99900;
      } else {
        throw new AppError('Invalid plan requested. Must be PRO or ENTERPRISE.', 400, 'INVALID_PLAN');
      }

      if (!planId) {
        throw new AppError(
          `Razorpay domestic plan ID for ${params.plan} is not configured on this server. Contact support or sales.`,
          503,
          'PLAN_NOT_CONFIGURED'
        );
      }
    } else {
      // NON-INDIA / GLOBAL ROUTING:
      // STRICT SAFETY: Do NOT fall back to domestic INR plan.
      const isIntlEnabled = isRazorpayInternationalEnabled();
      const globalCurrency = getRazorpayGlobalCurrency();

      if (!isIntlEnabled || !globalCurrency) {
        throw new AppError(
          'International billing is not configured for this account yet. India billing remains available for eligible Indian customers.',
          503,
          'INTERNATIONAL_BILLING_NOT_CONFIGURED'
        );
      }

      currency = globalCurrency.toUpperCase();

      if (params.plan === 'PRO') {
        planId = getRazorpayGlobalProPlanId();
        targetPlan = UserPlan.PRO;
        amountInMinor = 0;
      } else if (params.plan === 'ENTERPRISE') {
        planId = getRazorpayGlobalEnterprisePlanId();
        targetPlan = UserPlan.ENTERPRISE;
        amountInMinor = 0;
      } else {
        throw new AppError('Invalid plan requested. Must be PRO or ENTERPRISE.', 400, 'INVALID_PLAN');
      }

      if (!planId) {
        throw new AppError(
          'International billing is not configured for this account yet. India billing remains available for eligible Indian customers.',
          503,
          'INTERNATIONAL_BILLING_NOT_CONFIGURED'
        );
      }
    }

    // Prevent duplicate active subscriptions for the same plan
    if (
      user.subscription &&
      user.subscription.plan === targetPlan &&
      (user.subscription.status === SubscriptionStatus.ACTIVE ||
       user.subscription.status === SubscriptionStatus.AUTHENTICATED ||
       user.subscription.status === SubscriptionStatus.PENDING)
    ) {
      throw new AppError(
        `You already have an active ${user.subscription.plan} subscription (${user.subscription.status}). Please manage your existing subscription from the billing dashboard.`,
        400,
        'ACTIVE_SUBSCRIPTION_EXISTS'
      );
    }

    const razorpay = getRazorpay();
    const totalCount = params.totalCount && params.totalCount > 0 ? params.totalCount : 12;

    try {
      // Create Razorpay customer if not already existing
      let customerId = user.razorpayCustomerId;
      if (!customerId) {
        try {
          const customer = await razorpay.customers.create({
            name: user.name,
            email: user.email,
            notes: {
              userId: user.id,
              source: 'ByGoodAI Unified Billing',
            },
          });
          customerId = customer.id;
          await prisma.user.update({
            where: { id: user.id },
            data: { razorpayCustomerId: customerId },
          });
        } catch (custErr: any) {
          // If customer creation fails (e.g. duplicate email in Razorpay test mode), proceed with subscription
          console.warn('[Razorpay Customer Notice]:', custErr?.error?.description || custErr?.message);
        }
      }

      // Initialize Subscription via Razorpay API
      const subscriptionPayload: any = {
        plan_id: planId,
        total_count: totalCount,
        quantity: 1,
        customer_notify: 1,
        notes: {
          userId: user.id,
          userEmail: user.email,
          targetPlan,
          currency,
          platform: 'ByGoodAI Platform',
        },
      };

      if (customerId) {
        subscriptionPayload.customer_id = customerId;
      }

      const subscription = await razorpay.subscriptions.create(subscriptionPayload);

      const rzpTotalCount = typeof subscription.total_count === 'number'
        ? subscription.total_count
        : parseInt(String(subscription.total_count || totalCount), 10) || totalCount;
      const rzpPaidCount = typeof subscription.paid_count === 'number'
        ? subscription.paid_count
        : parseInt(String(subscription.paid_count || 0), 10) || 0;
      const rzpRemainingCount = typeof subscription.remaining_count === 'number'
        ? subscription.remaining_count
        : parseInt(String(subscription.remaining_count || totalCount), 10) || totalCount;

      // Record subscription in PostgreSQL
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          provider: 'RAZORPAY',
          currency,
          amount: amountInMinor,
          razorpayCustomerId: customerId || null,
          razorpaySubscriptionId: subscription.id,
          razorpayPlanId: planId,
          status: mapRazorpayStatusToInternal(subscription.status),
          plan: targetPlan,
          totalCount: rzpTotalCount,
          paidCount: rzpPaidCount,
          remainingCount: rzpRemainingCount,
        },
        update: {
          provider: 'RAZORPAY',
          currency,
          amount: amountInMinor,
          razorpayCustomerId: customerId || null,
          razorpaySubscriptionId: subscription.id,
          razorpayPlanId: planId,
          status: mapRazorpayStatusToInternal(subscription.status),
          plan: targetPlan,
          totalCount: rzpTotalCount,
          paidCount: rzpPaidCount,
          remainingCount: rzpRemainingCount,
          cancelledAt: null,
        },
      });

      return {
        subscriptionId: subscription.id,
        keyId: getRazorpayKeyId()!,
        plan: targetPlan,
        currency,
        totalCount,
        user: {
          name: user.name,
          email: user.email,
        },
      };
    } catch (err: any) {
      console.error('[Razorpay Create Subscription Error]:', err?.error || err?.message || err);
      if (err instanceof AppError) throw err;
      throw new AppError(
        err?.error?.description || err?.message || 'Failed to create Razorpay subscription',
        err?.statusCode || 500,
        'RAZORPAY_API_ERROR'
      );
    }
  }

  /**
   * Cryptographically verifies Razorpay payment signature after successful frontend checkout,
   * validates ownership, queries Razorpay for authoritative subscription status,
   * and updates user plan via internal entitlement system.
   */
  async verifyPayment(params: {
    userId: string;
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) {
    if (!isRazorpayConfigured()) {
      throw new AppError('Razorpay billing is not configured on this server', 503, 'BILLING_NOT_CONFIGURED');
    }

    // 1. Enforce subscription ownership in database
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: params.razorpay_subscription_id },
      include: { user: true },
    });

    if (subscriptionRecord && subscriptionRecord.userId !== params.userId) {
      throw new AppError('Unauthorized: Subscription does not belong to the current authenticated user', 403, 'FORBIDDEN');
    }

    // 2. Cryptographically verify signature
    const isValidSignature = verifySubscriptionPaymentSignature(params);
    if (!isValidSignature) {
      throw new AppError('Invalid Razorpay payment signature. Entitlement update rejected.', 400, 'INVALID_SIGNATURE');
    }

    // 3. Query Razorpay API for authoritative subscription state
    let authoritativeStatus: SubscriptionStatus = SubscriptionStatus.ACTIVE;
    let authoritativePlan = subscriptionRecord?.plan || UserPlan.PRO;
    let currentPeriodEnd: Date | null = null;
    let paidCount = 1;

    try {
      const razorpay = getRazorpay();
      const rzpSub = await razorpay.subscriptions.fetch(params.razorpay_subscription_id);

      authoritativeStatus = mapRazorpayStatusToInternal(rzpSub.status);
      paidCount = rzpSub.paid_count || 1;

      if (rzpSub.current_end) {
        currentPeriodEnd = new Date(rzpSub.current_end * 1000);
      }

      // Check plan ID from Razorpay object
      if (rzpSub.plan_id) {
        if (rzpSub.plan_id === getRazorpayEnterprisePlanId() || rzpSub.plan_id === getRazorpayGlobalEnterprisePlanId()) {
          authoritativePlan = UserPlan.ENTERPRISE;
        } else if (rzpSub.plan_id === getRazorpayProPlanId() || rzpSub.plan_id === getRazorpayGlobalProPlanId()) {
          authoritativePlan = UserPlan.PRO;
        }
      }
    } catch (fetchErr: any) {
      console.warn('[Razorpay Fetch Subscription Notice]:', fetchErr?.error || fetchErr?.message);
    }

    // 4. Update Subscription in PostgreSQL
    await prisma.subscription.upsert({
      where: { razorpaySubscriptionId: params.razorpay_subscription_id },
      create: {
        userId: params.userId,
        provider: 'RAZORPAY',
        currency: subscriptionRecord?.currency || 'INR',
        amount: subscriptionRecord?.amount || null,
        razorpaySubscriptionId: params.razorpay_subscription_id,
        razorpayPlanId: subscriptionRecord?.razorpayPlanId || 'plan_verified',
        status: authoritativeStatus,
        plan: authoritativePlan,
        paidCount,
        currentPeriodEnd: currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        status: authoritativeStatus,
        paidCount,
        currentPeriodEnd: currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 5. Grant plan entitlement
    await this.grantPlanEntitlement(params.userId, authoritativePlan, 'RAZORPAY_PAYMENT_VERIFIED');

    return {
      verified: true,
      plan: authoritativePlan,
      status: authoritativeStatus,
      razorpaySubscriptionId: params.razorpay_subscription_id,
      currentPeriodEnd: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
    };
  }

  /**
   * Internal entitlement gateway: grants or updates user plan.
   * Keeps internal User.plan independent of specific payment gateways.
   */
  async grantPlanEntitlement(userId: string, targetPlan: UserPlan, source: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: targetPlan },
    });

    // Create confirmation notification
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: `Plan Updated: ${targetPlan}`,
          message: `Your account has been updated to ${targetPlan} tier (${source}).`,
          type: 'SUCCESS',
        },
      });
    } catch {
      // Non-blocking notification creation
    }
  }

  /**
   * Cancels a user subscription server-side via Razorpay API and marks status in PostgreSQL
   */
  async cancelSubscription(userId: string) {
    if (!isRazorpayConfigured()) {
      throw new AppError('Razorpay billing is not configured on this server', 503, 'BILLING_NOT_CONFIGURED');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription || !user.subscription.razorpaySubscriptionId) {
      throw new AppError('No active subscription found to cancel', 404, 'SUBSCRIPTION_NOT_FOUND');
    }

    const sub = user.subscription;

    try {
      const razorpay = getRazorpay();
      // Cancel at cycle end so user retains remaining paid period
      await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, false);
    } catch (cancelErr: any) {
      console.warn('[Razorpay Cancel Subscription Notice]:', cancelErr?.error || cancelErr?.message);
    }

    const now = new Date();
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: now,
      },
    });

    return {
      cancelled: true,
      status: 'CANCELLED',
      cancelledAt: now.toISOString(),
    };
  }

  /**
   * Handles incoming Razorpay Webhook events.
   * Validates HMAC signature, enforces event ID requirement, deduplicates via PostgreSQL unique constraint,
   * validates plan IDs, and synchronizes User.plan authoritatively.
   */
  async handleWebhook(rawBody: string | Buffer, signature?: string) {
    if (!signature) {
      throw new AppError('Missing Razorpay signature header', 400, 'MISSING_SIGNATURE');
    }

    const isSignatureValid = verifyWebhookSignature(rawBody, signature);
    if (!isSignatureValid) {
      throw new AppError('Invalid Razorpay webhook signature', 400, 'INVALID_SIGNATURE');
    }

    const rawString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    let payload: any;
    try {
      payload = JSON.parse(rawString);
    } catch {
      throw new AppError('Invalid webhook JSON body', 400, 'INVALID_JSON');
    }

    const eventId = payload.id;
    if (!eventId || typeof eventId !== 'string' || eventId.trim().length === 0) {
      throw new AppError('Webhook event missing required event ID (id)', 400, 'MISSING_EVENT_ID');
    }

    const eventType = payload.event;
    if (!eventType) {
      throw new AppError('Webhook missing event type', 400, 'MISSING_EVENT_TYPE');
    }

    // Idempotency: Insert-first claim strategy via PostgreSQL unique constraint on (provider, eventId)
    try {
      await prisma.webhookEvent.create({
        data: {
          provider: 'RAZORPAY',
          eventId,
          eventType,
        },
      });
    } catch (err: any) {
      // P2002 is Prisma unique constraint violation code
      if (err.code === 'P2002' || err.message?.includes('Unique constraint')) {
        return {
          received: true,
          alreadyProcessed: true,
          eventId,
          eventType,
        };
      }
      throw err;
    }

    // Process subscription lifecycle events
    const subscriptionEntity = payload.payload?.subscription?.entity;
    if (subscriptionEntity && subscriptionEntity.id) {
      const rzpSubId = subscriptionEntity.id;
      const rzpStatus = subscriptionEntity.status;
      const rzpPlanId = subscriptionEntity.plan_id;
      const paidCount = subscriptionEntity.paid_count || 0;
      const currentEnd = subscriptionEntity.current_end ? new Date(subscriptionEntity.current_end * 1000) : null;
      const currentStart = subscriptionEntity.current_start ? new Date(subscriptionEntity.current_start * 1000) : null;

      // Locate matching subscription in database
      const existingSub = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: rzpSubId },
        include: { user: true },
      });

      if (existingSub) {
        const isDomesticSub = existingSub.currency === 'INR';
        let validatedPlan: UserPlan | null = null;

        if (isDomesticSub) {
          if (rzpPlanId === getRazorpayEnterprisePlanId()) {
            validatedPlan = UserPlan.ENTERPRISE;
          } else if (rzpPlanId === getRazorpayProPlanId()) {
            validatedPlan = UserPlan.PRO;
          }
        } else {
          const globalEnt = getRazorpayGlobalEnterprisePlanId();
          const globalPro = getRazorpayGlobalProPlanId();
          if (globalEnt && rzpPlanId === globalEnt) {
            validatedPlan = UserPlan.ENTERPRISE;
          } else if (globalPro && rzpPlanId === globalPro) {
            validatedPlan = UserPlan.PRO;
          }
        }

        // Webhook plan safety validation: Reject plan mismatch across regions or invalid plan IDs
        if (!validatedPlan) {
          console.warn(
            `[Razorpay Webhook Safety Warning]: Plan ID ${rzpPlanId} does not match subscription context (${existingSub.currency}) for sub ${existingSub.id}`
          );
          return {
            received: true,
            rejected: true,
            reason: 'PLAN_ID_MISMATCH',
            eventId,
            eventType,
          };
        }

        const internalStatus = mapRazorpayStatusToInternal(rzpStatus);

        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: internalStatus,
            plan: validatedPlan,
            paidCount,
            currentPeriodStart: currentStart || existingSub.currentPeriodStart,
            currentPeriodEnd: currentEnd || existingSub.currentPeriodEnd,
          },
        });

        // Entitlement synchronization based on lifecycle
        if (
          eventType === 'subscription.activated' ||
          eventType === 'subscription.charged' ||
          eventType === 'subscription.authenticated'
        ) {
          if (internalStatus === SubscriptionStatus.ACTIVE || internalStatus === SubscriptionStatus.AUTHENTICATED) {
            await this.grantPlanEntitlement(existingSub.userId, validatedPlan, `WEBHOOK_${eventType}`);
          }
        } else if (
          eventType === 'subscription.completed' ||
          eventType === 'subscription.expired' ||
          eventType === 'subscription.cancelled'
        ) {
          // If subscription has expired or completed, downgrade to FREE
          const isPeriodEnded = !currentEnd || currentEnd.getTime() <= Date.now();
          if (isPeriodEnded || eventType === 'subscription.completed' || eventType === 'subscription.expired') {
            await this.grantPlanEntitlement(existingSub.userId, UserPlan.FREE, `WEBHOOK_${eventType}`);
          }
        }
      }
    }

    return {
      received: true,
      processed: true,
      eventId,
      eventType,
    };
  }

  /**
   * Generates a safe readiness and configuration status report
   */
  getReadinessReport(): ReadinessCheckReport {
    const isConfigured = isRazorpayConfigured();
    const isGlobal = isRazorpayGlobalBillingConfigured();
    const globalCurrency = getRazorpayGlobalCurrency();

    return {
      razorpay: isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED',
      internationalPayments: isGlobal ? 'CONFIGURED' : 'CONFIGURATION REQUIRED',
      googlePay: isConfigured ? 'AVAILABLE VIA RAZORPAY WHERE SUPPORTED' : 'CONFIGURATION REQUIRED',
      globalCurrency: globalCurrency ? 'CONFIGURED' : 'NOT CONFIGURED',
      globalBilling: isGlobal ? 'CONFIGURED' : 'CONFIGURATION REQUIRED',
      testMode: isRazorpayTestMode(),
      keyIdConfigured: Boolean(getRazorpayKeyId()),
      webhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      proPlanConfigured: Boolean(getRazorpayProPlanId()),
      enterprisePlanConfigured: Boolean(getRazorpayEnterprisePlanId()),
      globalProPlanConfigured: Boolean(getRazorpayGlobalProPlanId()),
      globalEnterprisePlanConfigured: Boolean(getRazorpayGlobalEnterprisePlanId()),
    };
  }
}

export const billingService = new BillingService();
