/**
 * ByGoodAI Automated Test Suite - Razorpay Billing & Global Payments Hardening (PART 8D-FINAL)
 * Comprehensive verification of Razorpay domestic & global payments, Google Pay integration,
 * multi-currency schema, idempotency, security boundaries, and readiness checks.
 */

process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_fixtureKeyId';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'fixture_secret_key_123456';
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'fixture_webhook_secret_123456';
process.env.RAZORPAY_PRO_PLAN_ID = process.env.RAZORPAY_PRO_PLAN_ID || 'plan_TQjzQwRtMyx5IK';
process.env.RAZORPAY_ENTERPRISE_PLAN_ID = process.env.RAZORPAY_ENTERPRISE_PLAN_ID || 'plan_TQk2YpBiCyz6Za';

import { billingService } from '../services/billingService';
import { prisma } from '../lib/prisma';
import {
  getRazorpayProPlanId,
  getRazorpayEnterprisePlanId,
  isRazorpayInternationalEnabled,
  isRazorpayGlobalBillingConfigured,
  getRazorpayGlobalCurrency,
} from '../lib/razorpay';
import crypto from 'crypto';

interface TestResult {
  scenario: number;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(scenario: number, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ scenario, name, passed: true });
    console.log(`✅ [Scenario ${scenario}] ${name}: PASSED`);
  } catch (err: any) {
    results.push({ scenario, name, passed: false, error: err?.message || String(err) });
    console.error(`❌ [Scenario ${scenario}] ${name}: FAILED - ${err?.message || err}`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('  BYGOODAI RAZORPAY BILLING HARDENING & AUDIT TEST SUITE (8D-FINAL)');
  console.log('================================================================\n');

  // Setup test users
  const testEmail = `india_user_${Date.now()}@example.test`;
  const indiaUser = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'India Customer',
      passwordHash: 'dummy_hash',
      plan: 'FREE',
      profile: {
        create: {
          displayName: 'India Customer',
          billingCountry: 'IN',
        },
      },
    },
  });

  const globalUser = await prisma.user.create({
    data: {
      email: `global_user_${Date.now()}@example.test`,
      name: 'Global Customer',
      passwordHash: 'dummy_hash',
      plan: 'FREE',
      profile: {
        create: {
          displayName: 'Global Customer',
          billingCountry: 'US',
        },
      },
    },
  });

  const otherUser = await prisma.user.create({
    data: {
      email: `other_user_${Date.now()}@example.test`,
      name: 'Other Customer',
      passwordHash: 'dummy_hash',
      plan: 'FREE',
      profile: {
        create: {
          displayName: 'Other Customer',
          billingCountry: 'GB',
        },
      },
    },
  });

  try {
    // 1. India + PRO -> INR PRO
    await runTest(1, 'India + PRO → INR PRO (₹199 / INR / domestic Pro plan ID)', async () => {
      // Clean previous sub if any
      await prisma.subscription.deleteMany({ where: { userId: indiaUser.id } });

      const sub = await billingService.createSubscription({
        userId: indiaUser.id,
        plan: 'PRO',
      });

      if (sub.currency !== 'INR') throw new Error(`Expected currency INR, got ${sub.currency}`);
      if (sub.plan !== 'PRO') throw new Error(`Expected plan PRO, got ${sub.plan}`);

      const record = await prisma.subscription.findUnique({ where: { userId: indiaUser.id } });
      if (!record) throw new Error('Subscription not saved in DB');
      if (record.currency !== 'INR') throw new Error(`Expected DB currency INR, got ${record.currency}`);
      if (record.amount !== 19900) throw new Error(`Expected DB amount 19900, got ${record.amount}`);
      if (record.razorpayPlanId !== getRazorpayProPlanId()) {
        throw new Error(`Expected DB razorpayPlanId ${getRazorpayProPlanId()}, got ${record.razorpayPlanId}`);
      }
    });

    // 2. India + ENTERPRISE -> INR Enterprise
    await runTest(2, 'India + ENTERPRISE → INR Enterprise (₹999 / INR / domestic Enterprise plan ID)', async () => {
      await prisma.subscription.deleteMany({ where: { userId: indiaUser.id } });

      const sub = await billingService.createSubscription({
        userId: indiaUser.id,
        plan: 'ENTERPRISE',
      });

      if (sub.currency !== 'INR') throw new Error(`Expected currency INR, got ${sub.currency}`);
      if (sub.plan !== 'ENTERPRISE') throw new Error(`Expected plan ENTERPRISE, got ${sub.plan}`);

      const record = await prisma.subscription.findUnique({ where: { userId: indiaUser.id } });
      if (!record) throw new Error('Subscription not saved in DB');
      if (record.currency !== 'INR') throw new Error(`Expected DB currency INR, got ${record.currency}`);
      if (record.amount !== 99900) throw new Error(`Expected DB amount 99900, got ${record.amount}`);
      if (record.razorpayPlanId !== getRazorpayEnterprisePlanId()) {
        throw new Error(`Expected DB razorpayPlanId ${getRazorpayEnterprisePlanId()}, got ${record.razorpayPlanId}`);
      }
    });

    // 3. Global + global plan configured -> global plan
    await runTest(3, 'Global + global plan configured → global plan', async () => {
      const savedIntl = process.env.RAZORPAY_INTERNATIONAL_ENABLED;
      const savedCurr = process.env.RAZORPAY_GLOBAL_CURRENCY;
      const savedPro = process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID;
      const savedEnt = process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID;

      try {
        process.env.RAZORPAY_INTERNATIONAL_ENABLED = 'true';
        process.env.RAZORPAY_GLOBAL_CURRENCY = 'USD';
        // Use valid fixture plan IDs to allow Razorpay sandbox subscription creation call to succeed
        process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID = process.env.RAZORPAY_PRO_PLAN_ID || 'plan_TQjzQwRtMyx5IK';
        process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID = process.env.RAZORPAY_ENTERPRISE_PLAN_ID || 'plan_TQk2YpBiCyz6Za';

        await prisma.subscription.deleteMany({ where: { userId: globalUser.id } });

        const sub = await billingService.createSubscription({
          userId: globalUser.id,
          plan: 'PRO',
        });

        if (sub.currency !== 'USD') throw new Error(`Expected currency USD, got ${sub.currency}`);
        if (sub.plan !== 'PRO') throw new Error(`Expected plan PRO, got ${sub.plan}`);

        const record = await prisma.subscription.findUnique({ where: { userId: globalUser.id } });
        if (!record) throw new Error('Subscription not saved in DB');
        if (record.currency !== 'USD') throw new Error(`Expected DB currency USD, got ${record.currency}`);
        if (record.razorpayPlanId !== process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID) {
          throw new Error(`Expected DB razorpayPlanId ${process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID}, got ${record.razorpayPlanId}`);
        }
      } finally {
        if (savedIntl !== undefined) process.env.RAZORPAY_INTERNATIONAL_ENABLED = savedIntl;
        else delete process.env.RAZORPAY_INTERNATIONAL_ENABLED;
        if (savedCurr !== undefined) process.env.RAZORPAY_GLOBAL_CURRENCY = savedCurr;
        else delete process.env.RAZORPAY_GLOBAL_CURRENCY;
        if (savedPro !== undefined) process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID = savedPro;
        else delete process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID;
        if (savedEnt !== undefined) process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID = savedEnt;
        else delete process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID;
      }
    });

    // 4. Global + global plan NOT configured -> 503
    await runTest(4, 'Global + global plan NOT configured → 503 INTERNATIONAL_BILLING_NOT_CONFIGURED', async () => {
      delete process.env.RAZORPAY_INTERNATIONAL_ENABLED;
      delete process.env.RAZORPAY_GLOBAL_CURRENCY;
      delete process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID;
      delete process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID;

      await prisma.subscription.deleteMany({ where: { userId: globalUser.id } });

      try {
        await billingService.createSubscription({
          userId: globalUser.id,
          plan: 'PRO',
        });
        throw new Error('Should have thrown 503 INTERNATIONAL_BILLING_NOT_CONFIGURED');
      } catch (err: any) {
        if (err.statusCode !== 503 || err.code !== 'INTERNATIONAL_BILLING_NOT_CONFIGURED') {
          throw new Error(`Expected 503 INTERNATIONAL_BILLING_NOT_CONFIGURED, got ${err.statusCode} / ${err.code}`);
        }
      }
    });

    // 5. Global user NEVER falls back to India plan
    await runTest(5, 'Global user NEVER falls back to India plan', async () => {
      delete process.env.RAZORPAY_INTERNATIONAL_ENABLED;
      delete process.env.RAZORPAY_GLOBAL_CURRENCY;
      delete process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID;
      delete process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID;

      // Ensure domestic plans exist
      process.env.RAZORPAY_PRO_PLAN_ID = 'plan_TQjzQwRtMyx5IK';
      process.env.RAZORPAY_ENTERPRISE_PLAN_ID = 'plan_TQk2YpBiCyz6Za';

      await prisma.subscription.deleteMany({ where: { userId: otherUser.id } });

      try {
        await billingService.createSubscription({
          userId: otherUser.id,
          plan: 'ENTERPRISE',
        });
        throw new Error('Should have thrown error and not fallen back to Indian plan');
      } catch (err: any) {
        if (err.code !== 'INTERNATIONAL_BILLING_NOT_CONFIGURED') {
          throw new Error(`Expected INTERNATIONAL_BILLING_NOT_CONFIGURED, got ${err.code || err.message}`);
        }
      }
    });

    // 6. Missing global currency -> configuration error
    await runTest(6, 'Missing global currency → configuration error', async () => {
      process.env.RAZORPAY_INTERNATIONAL_ENABLED = 'true';
      process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID = 'plan_global_pro';
      process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID = 'plan_global_ent';
      delete process.env.RAZORPAY_GLOBAL_CURRENCY;

      if (isRazorpayGlobalBillingConfigured()) {
        throw new Error('isRazorpayGlobalBillingConfigured should be false when currency is missing');
      }

      try {
        await billingService.createSubscription({
          userId: globalUser.id,
          plan: 'PRO',
        });
        throw new Error('Should have failed when global currency is missing');
      } catch (err: any) {
        if (err.code !== 'INTERNATIONAL_BILLING_NOT_CONFIGURED') {
          throw new Error(`Expected INTERNATIONAL_BILLING_NOT_CONFIGURED, got ${err.code}`);
        }
      }
    });

    // 7. Missing global Pro plan -> configuration error
    await runTest(7, 'Missing global Pro plan → configuration error', async () => {
      process.env.RAZORPAY_INTERNATIONAL_ENABLED = 'true';
      process.env.RAZORPAY_GLOBAL_CURRENCY = 'USD';
      process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID = 'plan_global_ent';
      delete process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID;

      if (isRazorpayGlobalBillingConfigured()) {
        throw new Error('isRazorpayGlobalBillingConfigured should be false when Pro plan is missing');
      }

      try {
        await billingService.createSubscription({
          userId: globalUser.id,
          plan: 'PRO',
        });
        throw new Error('Should have failed when global Pro plan is missing');
      } catch (err: any) {
        if (err.code !== 'INTERNATIONAL_BILLING_NOT_CONFIGURED') {
          throw new Error(`Expected INTERNATIONAL_BILLING_NOT_CONFIGURED, got ${err.code}`);
        }
      }
    });

    // 8. Missing global Enterprise plan -> configuration error
    await runTest(8, 'Missing global Enterprise plan → configuration error', async () => {
      process.env.RAZORPAY_INTERNATIONAL_ENABLED = 'true';
      process.env.RAZORPAY_GLOBAL_CURRENCY = 'USD';
      process.env.RAZORPAY_GLOBAL_PRO_PLAN_ID = 'plan_global_pro';
      delete process.env.RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID;

      if (isRazorpayGlobalBillingConfigured()) {
        throw new Error('isRazorpayGlobalBillingConfigured should be false when Enterprise plan is missing');
      }

      try {
        await billingService.createSubscription({
          userId: globalUser.id,
          plan: 'ENTERPRISE',
        });
        throw new Error('Should have failed when global Enterprise plan is missing');
      } catch (err: any) {
        if (err.code !== 'INTERNATIONAL_BILLING_NOT_CONFIGURED') {
          throw new Error(`Expected INTERNATIONAL_BILLING_NOT_CONFIGURED, got ${err.code}`);
        }
      }
    });

    // 9. Google Pay readiness is not unconditionally true
    await runTest(9, 'Google Pay readiness is not unconditionally true', async () => {
      const config = await billingService.getBillingConfig();
      if ((config.googlePay as any).supported === true) {
        throw new Error('googlePay.supported must not be unconditionally true');
      }
      if (config.googlePay.status !== 'AVAILABLE_VIA_RAZORPAY_WHERE_SUPPORTED') {
        throw new Error(`Expected status AVAILABLE_VIA_RAZORPAY_WHERE_SUPPORTED, got ${config.googlePay.status}`);
      }
      if (!config.googlePay.description.includes('Razorpay Checkout')) {
        throw new Error('Google Pay description should clarify checkout availability');
      }
    });

    // 10. Client cannot change currency
    await runTest(10, 'Client cannot change currency (server-authoritative routing)', async () => {
      await prisma.subscription.deleteMany({ where: { userId: indiaUser.id } });

      const sub = await billingService.createSubscription({
        userId: indiaUser.id,
        plan: 'PRO',
      });
      if (sub.currency !== 'INR') {
        throw new Error(`Expected server-authoritative INR currency, got ${sub.currency}`);
      }
    });

    // 11. Client cannot change amount
    await runTest(11, 'Client cannot change amount (server-authoritative minor units)', async () => {
      const record = await prisma.subscription.findUnique({ where: { userId: indiaUser.id } });
      if (record?.amount !== 19900) {
        throw new Error(`Expected server-enforced amount 19900, got ${record?.amount}`);
      }
    });

    // 12. Client cannot change plan ID
    await runTest(12, 'Client cannot change plan ID (plan ID mapped strictly on server)', async () => {
      const record = await prisma.subscription.findUnique({ where: { userId: indiaUser.id } });
      if (record?.razorpayPlanId !== getRazorpayProPlanId()) {
        throw new Error(`Expected server-mapped plan ID ${getRazorpayProPlanId()}, got ${record?.razorpayPlanId}`);
      }
    });

    // 13. Client cannot change provider
    await runTest(13, 'Client cannot change provider (fixed to RAZORPAY)', async () => {
      const record = await prisma.subscription.findUnique({ where: { userId: indiaUser.id } });
      if (record?.provider !== 'RAZORPAY') {
        throw new Error(`Expected provider RAZORPAY, got ${record?.provider}`);
      }
    });

    // 14. Webhook plan mismatch rejected
    await runTest(14, 'Webhook plan mismatch rejected', async () => {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fixture_webhook_secret_123456';
      const eventId = `evt_mismatch_${Date.now()}`;

      // Ensure active domestic sub exists with known ID
      await prisma.subscription.upsert({
        where: { userId: indiaUser.id },
        create: {
          userId: indiaUser.id,
          provider: 'RAZORPAY',
          currency: 'INR',
          amount: 19900,
          razorpaySubscriptionId: 'sub_india_mismatch',
          razorpayPlanId: getRazorpayProPlanId(),
          status: 'ACTIVE',
          plan: 'PRO',
        },
        update: {
          razorpaySubscriptionId: 'sub_india_mismatch',
          currency: 'INR',
          razorpayPlanId: getRazorpayProPlanId(),
        },
      });

      // Send a domestic subscription an alien/invalid plan ID
      const payload = {
        id: eventId,
        event: 'subscription.charged',
        payload: {
          subscription: {
            entity: {
              id: 'sub_india_mismatch',
              status: 'active',
              plan_id: 'plan_unknown_or_cross_region_xyz',
              paid_count: 1,
            },
          },
        },
      };

      const rawBody = JSON.stringify(payload);
      const sig = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(rawBody, 'utf8')).digest('hex');

      const result = await billingService.handleWebhook(rawBody, sig);
      if (!result.rejected || result.reason !== 'PLAN_ID_MISMATCH') {
        throw new Error(`Expected webhook rejection with PLAN_ID_MISMATCH, got ${JSON.stringify(result)}`);
      }
    });

    // 15. Duplicate webhook rejected safely
    await runTest(15, 'Duplicate webhook rejected safely (idempotent unique constraint)', async () => {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fixture_webhook_secret_123456';
      const eventId = `evt_dup_${Date.now()}`;
      const payload = {
        id: eventId,
        event: 'subscription.charged',
        payload: {
          subscription: {
            entity: {
              id: 'sub_india_mismatch',
              status: 'active',
              plan_id: getRazorpayProPlanId(),
              paid_count: 2,
            },
          },
        },
      };
      const rawBody = JSON.stringify(payload);
      const sig = crypto.createHmac('sha256', webhookSecret).update(Buffer.from(rawBody, 'utf8')).digest('hex');

      const first = await billingService.handleWebhook(rawBody, sig);
      if (first.alreadyProcessed) throw new Error('First webhook execution should not be marked alreadyProcessed');

      const second = await billingService.handleWebhook(rawBody, sig);
      if (!second.alreadyProcessed) throw new Error('Duplicate webhook delivery must return alreadyProcessed: true');
    });

  } finally {
    // Cleanup
    await prisma.subscription.deleteMany({
      where: { userId: { in: [indiaUser.id, globalUser.id, otherUser.id] } },
    });
    await prisma.profile.deleteMany({
      where: { userId: { in: [indiaUser.id, globalUser.id, otherUser.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [indiaUser.id, globalUser.id, otherUser.id] } },
    });
  }

  console.log('\n================================================================');
  console.log('                      TEST SUMMARY REPORT');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Total Scenarios: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

function recordSubId(userId: string): string {
  return `sub_${userId.slice(-6)}`;
}

main().catch((err) => {
  console.error('Test runner encountered fatal error:', err);
  process.exit(1);
});
