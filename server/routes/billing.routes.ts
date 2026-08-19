/**
 * ByGoodAI Server - Razorpay Billing & Subscription API Routes
 * Endpoints for public billing configuration, subscription status,
 * Razorpay subscription initialization, checkout, payment verification, cancellation, and webhook handling.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware';
import { billingService } from '../services/billingService';
import { AppError } from '../middleware/errorHandler';

export const billingRouter = Router();

/**
 * GET /api/billing/config
 * Public endpoint returning active plan limits, currency, and Razorpay payment configuration
 */
billingRouter.get('/config', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await billingService.getBillingConfig();
    return res.json({
      success: true,
      data: config,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/billing/readiness
 * Returns deployment and configuration readiness status across payment channels
 */
billingRouter.get('/readiness', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const readiness = billingService.getReadinessReport();
    return res.json({
      success: true,
      data: readiness,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/billing/subscription
 * Authenticated endpoint returning user subscription status & Razorpay details from PostgreSQL
 */
billingRouter.get('/subscription', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const subscriptionData = await billingService.getUserSubscription(user.id);

    return res.json({
      success: true,
      data: subscriptionData,
    });
  } catch (err) {
    next(err);
  }
});

const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
  totalCount: z.number().int().min(1).max(120).optional().default(12),
});

/**
 * POST /api/billing/checkout
 * Standard server-authoritative checkout initialization endpoint.
 * Accepts only plan identifier; amount, currency, and planId are strictly determined on the server.
 */
billingRouter.post('/checkout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const parsed = checkoutSchema.safeParse(req.body);

    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Invalid checkout payload';
      throw new AppError(msg, 400, 'VALIDATION_ERROR');
    }

    const result = await billingService.createSubscription({
      userId: user.id,
      plan: parsed.data.plan,
      totalCount: parsed.data.totalCount,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/billing/razorpay/create-subscription
 * Backward-compatible endpoint to initialize a Razorpay Subscription on the server
 */
billingRouter.post(
  '/razorpay/create-subscription',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const parsed = checkoutSchema.safeParse(req.body);

      if (!parsed.success) {
        const msg = parsed.error.issues?.[0]?.message || 'Invalid subscription parameters';
        throw new AppError(msg, 400, 'VALIDATION_ERROR');
      }

      const result = await billingService.createSubscription({
        userId: user.id,
        plan: parsed.data.plan,
        totalCount: parsed.data.totalCount,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),
  razorpay_subscription_id: z.string().min(1, 'razorpay_subscription_id is required'),
  razorpay_signature: z.string().min(1, 'razorpay_signature is required'),
});

/**
 * POST /api/billing/razorpay/verify
 * Authenticated endpoint to cryptographically verify Razorpay payment signature and upgrade User.plan
 */
billingRouter.post('/razorpay/verify', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const parsed = verifyPaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Invalid verification payload';
      throw new AppError(msg, 400, 'VALIDATION_ERROR');
    }

    const result = await billingService.verifyPayment({
      userId: user.id,
      razorpay_payment_id: parsed.data.razorpay_payment_id,
      razorpay_subscription_id: parsed.data.razorpay_subscription_id,
      razorpay_signature: parsed.data.razorpay_signature,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/billing/razorpay/cancel
 * Authenticated endpoint to cancel a subscription server-side via Razorpay
 */
billingRouter.post('/razorpay/cancel', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const result = await billingService.cancelSubscription(user.id);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/billing/razorpay/webhook
 * Razorpay webhook handler with raw buffer HMAC signature verification and idempotency
 */
billingRouter.post('/razorpay/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature =
      (req.headers['x-razorpay-signature'] as string | undefined) ||
      (req.headers['razorpay-signature'] as string | undefined);

    if (!signature) {
      throw new AppError('Missing x-razorpay-signature header', 400, 'MISSING_SIGNATURE');
    }

    // Capture raw body from express raw/text middleware or fallback to req.body string
    let rawBody: string | Buffer;
    if (Buffer.isBuffer((req as any).rawBody)) {
      rawBody = (req as any).rawBody;
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else {
      rawBody = JSON.stringify(req.body);
    }

    const result = await billingService.handleWebhook(rawBody, signature);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
