/**
 * ByGoodAI Frontend - Razorpay Billing & Subscription API Client Service
 * Unified client for India and Global Razorpay checkout with Google Pay, Cards, and UPI support.
 */

import { apiClient } from './apiClient';

export interface PlanLimits {
  name: string;
  maxActiveApiKeys: number;
  monthlyAiRequests: number;
  monthlyApiRequests: number;
  monthlyToolExecutions: number;
  apiRateLimitPerMinute: number;
  maxInputPayloadBytes: number;
  maxAiInputChars: number;
  maxAiOutputTokens: number;
}

export interface PlanConfig {
  name: string;
  priceMonthly: number;
  priceAnnual?: number | null;
  currency?: string;
  planIdConfigured?: boolean;
  limits: PlanLimits;
}

export interface BillingConfigData {
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
  india?: {
    configured: boolean;
    currency: 'INR';
    proPlanConfigured: boolean;
    enterprisePlanConfigured: boolean;
  };
  global?: {
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
    free: PlanConfig;
    pro: PlanConfig;
    enterprise: PlanConfig;
  };
}

export interface UserSubscriptionResponse {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status:
    | 'CREATED'
    | 'AUTHENTICATED'
    | 'ACTIVE'
    | 'PENDING'
    | 'HALTED'
    | 'CANCELLED'
    | 'COMPLETED'
    | 'EXPIRED'
    | 'PAUSED';
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

export interface CreateSubscriptionResult {
  subscriptionId: string;
  keyId: string;
  plan: 'PRO' | 'ENTERPRISE';
  currency: string;
  totalCount: number;
  user: {
    name: string;
    email: string;
  };
}

export interface VerifyPaymentResult {
  verified: boolean;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: string;
  razorpaySubscriptionId: string;
  currentPeriodEnd: string | null;
}

export interface CancelSubscriptionResult {
  cancelled: boolean;
  status: string;
  cancelledAt: string;
}

export interface ReadinessCheckData {
  razorpay: 'CONFIGURED' | 'NOT CONFIGURED';
  internationalPayments: 'CONFIGURED' | 'CONFIGURATION REQUIRED';
  googlePay: 'AVAILABLE VIA RAZORPAY' | 'NOT CONFIGURED';
  globalCurrency: 'CONFIGURED' | 'NOT CONFIGURED';
  testMode: boolean;
  keyIdConfigured: boolean;
  webhookConfigured: boolean;
  proPlanConfigured: boolean;
  enterprisePlanConfigured: boolean;
  globalProPlanConfigured: boolean;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

class BillingClientService {
  /**
   * Retrieves public plan details, limits, and Razorpay configuration state
   */
  async getConfig(): Promise<BillingConfigData> {
    return apiClient.get<BillingConfigData>('/billing/config');
  }

  /**
   * Retrieves current user subscription and Razorpay status from PostgreSQL
   */
  async getSubscription(): Promise<UserSubscriptionResponse> {
    return apiClient.get<UserSubscriptionResponse>('/billing/subscription');
  }

  /**
   * Retrieves readiness and deployment configuration check
   */
  async getReadiness(): Promise<ReadinessCheckData> {
    return apiClient.get<ReadinessCheckData>('/billing/readiness');
  }

  /**
   * Initiates Razorpay Checkout creation on backend
   */
  async createSubscription(
    plan: 'PRO' | 'ENTERPRISE',
    totalCount: number = 12
  ): Promise<CreateSubscriptionResult> {
    return apiClient.post<CreateSubscriptionResult>('/billing/checkout', {
      plan,
      totalCount,
    });
  }

  /**
   * Verifies Razorpay payment signature after successful checkout
   */
  async verifyPayment(params: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }): Promise<VerifyPaymentResult> {
    return apiClient.post<VerifyPaymentResult>('/billing/razorpay/verify', params);
  }

  /**
   * Cancels user subscription server-side
   */
  async cancelSubscription(): Promise<CancelSubscriptionResult> {
    return apiClient.post<CancelSubscriptionResult>('/billing/razorpay/cancel', {});
  }

  /**
   * Opens Razorpay Standard Checkout modal for subscription with Google Pay, UPI, & Card support
   */
  async openCheckout(params: {
    subscriptionId: string;
    keyId: string;
    planName: string;
    userName?: string;
    userEmail?: string;
    onSuccess: (paymentData: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }) => void;
    onDismiss?: () => void;
  }): Promise<void> {
    // Ensure checkout script is loaded
    if (typeof window.Razorpay === 'undefined') {
      await this.loadRazorpayScript();
    }

    if (typeof window.Razorpay === 'undefined') {
      throw new Error('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
    }

    const options = {
      key: params.keyId,
      subscription_id: params.subscriptionId,
      name: 'ByGoodAI Platform',
      description: `${params.planName} Subscription`,
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_subscription_id: string;
        razorpay_signature: string;
      }) => {
        params.onSuccess(response);
      },
      prefill: {
        name: params.userName || '',
        email: params.userEmail || '',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: () => {
          if (params.onDismiss) {
            params.onDismiss();
          }
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  }

  /**
   * Helper to dynamically load Razorpay checkout.js script if not present
   */
  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('razorpay-checkout-script')) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay script'));
        document.body.appendChild(script);
      }
    });
  }
}

export const billingClientService = new BillingClientService();
