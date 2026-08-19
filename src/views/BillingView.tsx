/**
 * ByGoodAI Frontend - Razorpay Billing & Subscription Management View
 * Displays active plan status, renewal dates, usage allocations, and Razorpay subscription lifecycle.
 */

import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import {
  billingClientService,
  UserSubscriptionResponse,
  BillingConfigData,
} from '../services/billingClientService';
import { usageClientService, UsageSummary } from '../services/usageService';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Sparkles,
  Layers,
  Clock,
  KeyRound,
  RefreshCw,
  XCircle,
  Smartphone,
} from 'lucide-react';

export interface BillingViewProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionResponse | null>(null);
  const [billingConfig, setBillingConfig] = useState<BillingConfigData | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, [isAuthenticated]);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [config, subData, summary] = await Promise.all([
        billingClientService.getConfig().catch(() => null),
        isAuthenticated ? billingClientService.getSubscription().catch(() => null) : Promise.resolve(null),
        isAuthenticated ? usageClientService.getUsage().catch(() => null) : Promise.resolve(null),
      ]);

      if (config) setBillingConfig(config);
      if (subData) setSubscriptionData(subData);
      if (summary) setUsageSummary(summary);
    } catch (err: any) {
      console.warn('Failed to load billing information:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    if (!isAuthenticated) {
      onOpenAuth('register');
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const subData = await billingClientService.createSubscription('PRO', 12);

      if (!subData.subscriptionId || !subData.keyId) {
        throw new Error('Failed to initialize Razorpay subscription');
      }

      await billingClientService.openCheckout({
        subscriptionId: subData.subscriptionId,
        keyId: subData.keyId,
        planName: 'Developer Pro',
        userName: user?.name || undefined,
        userEmail: user?.email || undefined,
        onSuccess: async (paymentData) => {
          try {
            showToast('Verifying payment signature with server...', 'info');
            const verifyRes = await billingClientService.verifyPayment(paymentData);
            if (verifyRes.verified) {
              await refreshUser?.();
              await loadBillingData();
              showToast('Subscription activated successfully! Welcome to ByGoodAI Pro.', 'success');
            }
          } catch (vErr: any) {
            showToast(vErr.message || 'Signature verification failed.', 'error');
          }
        },
        onDismiss: () => {
          showToast('Checkout cancelled.', 'info');
        },
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize Razorpay checkout.', 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessingCancel(true);
    try {
      const res = await billingClientService.cancelSubscription();
      if (res.cancelled) {
        showToast('Subscription cancellation scheduled at period end.', 'info');
        setShowCancelConfirm(false);
        await refreshUser?.();
        await loadBillingData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel subscription with Razorpay.', 'error');
    } finally {
      setIsProcessingCancel(false);
    }
  };

  if (!isAuthenticated && !isAuthLoading) {
    return (
      <PageContainer
        title="Billing & Subscription"
        description="Manage your active workspace plan, subscription lifecycle, and billing quotas."
        breadcrumbs={[{ label: 'Billing', current: true }]}
        onNavigate={onNavigate}
      >
        <div className="max-w-md mx-auto my-12 text-center space-y-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
            <CreditCard className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">Sign in to view billing</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Subscriptions and quota allocations are linked to your authenticated developer workspace.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate('/pricing')}>
              View Plans
            </Button>
            <Button variant="primary" size="sm" onClick={() => onOpenAuth('login')}>
              Sign In
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const currentPlan = user?.plan || subscriptionData?.plan || 'FREE';
  const subStatus = subscriptionData?.status || 'CREATED';
  const isHalted = subStatus === 'HALTED' || subStatus === 'PENDING';
  const isCancelled = subStatus === 'CANCELLED';
  const isActive = subStatus === 'ACTIVE' || subStatus === 'AUTHENTICATED';

  const planLimits =
    currentPlan === 'ENTERPRISE'
      ? billingConfig?.plans.enterprise.limits
      : currentPlan === 'PRO'
      ? billingConfig?.plans.pro.limits
      : billingConfig?.plans.free.limits;

  return (
    <PageContainer
      title="Billing & Subscription"
      description="Manage your active plan, inspect usage allocations, and manage Razorpay subscriptions."
      breadcrumbs={[{ label: 'Billing', current: true }]}
      onNavigate={onNavigate}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Payment Warning Alert */}
        {isHalted && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4.5 flex items-start justify-between gap-4 text-xs text-rose-900 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm block">Subscription Payment Pending or Halted</span>
                <p className="text-rose-800 leading-relaxed">
                  Your last recurring charge via Razorpay could not be completed. Please ensure UPI / card funds are available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Active Subscription Plan Card */}
        <Card id="billing-plan-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">Active Workspace Plan</CardTitle>
                    <Badge
                      variant={currentPlan === 'ENTERPRISE' ? 'indigo' : currentPlan === 'PRO' ? 'default' : 'secondary'}
                      size="sm"
                    >
                      {currentPlan} TIER
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Authoritative PostgreSQL subscription state synchronized with Razorpay.
                  </CardDescription>
                </div>
              </div>

              {isActive && currentPlan === 'PRO' && subscriptionData?.razorpaySubscriptionId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isProcessingCancel}
                  className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">Plan Type</span>
                <span className="text-base font-bold text-neutral-900">
                  {currentPlan === 'PRO' ? 'Developer Pro' : currentPlan === 'ENTERPRISE' ? 'Enterprise' : 'Community Free'}
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  {currentPlan === 'PRO' ? '₹199/mo (Billed via Razorpay)' : currentPlan === 'ENTERPRISE' ? '₹999/mo (Billed via Razorpay)' : '₹0 forever'}
                </span>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      isHalted ? 'bg-rose-500' : isCancelled ? 'bg-neutral-400' : isActive ? 'bg-emerald-500' : 'bg-neutral-500'
                    }`}
                  />
                  <span className="text-sm font-bold text-neutral-900">
                    {subStatus}
                  </span>
                </div>
                {subscriptionData?.razorpaySubscriptionId && (
                  <span className="text-[10px] font-mono text-neutral-400 block truncate">
                    ID: {subscriptionData.razorpaySubscriptionId}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">Next Renewal</span>
                <span className="text-sm font-bold text-neutral-900 font-mono">
                  {subscriptionData?.chargeAt
                    ? new Date(subscriptionData.chargeAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : subscriptionData?.currentPeriodEnd
                    ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Monthly Rolling'}
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  Cycles: {subscriptionData?.paidCount ?? 0} paid
                </span>
              </div>
            </div>

            {/* Cancel Confirmation Modal / Panel */}
            {showCancelConfirm && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-rose-900">Confirm Subscription Cancellation</span>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Your subscription will be canceled with Razorpay at the end of your current paid billing period. Your history and API keys will remain safe, but quotas will revert to Community Free.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end pt-1">
                  <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)} disabled={isProcessingCancel}>
                    Keep Subscription
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelSubscription}
                    disabled={isProcessingCancel}
                  >
                    {isProcessingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                  </Button>
                </div>
              </div>
            )}

            {/* If on FREE plan, show Pro upgrade callout */}
            {currentPlan === 'FREE' && (
              <div className="rounded-2xl border border-neutral-900/10 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span className="text-sm font-bold">Unlock Developer Pro</span>
                    </div>
                    <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
                      Upgrade to Pro for 1,000 AI prompts/mo, 50,000 automated API requests/mo, 10 API keys, and 5MB input payloads. Supported via UPI, Google Pay, Cards, and NetBanking.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleUpgradeToPro}
                      disabled={isProcessingCheckout}
                      className="bg-white text-neutral-900 hover:bg-neutral-100 font-bold"
                    >
                      {isProcessingCheckout ? 'Opening Razorpay...' : 'Upgrade (₹199/mo)'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('/pricing')}
                      className="border-neutral-700 text-white hover:bg-neutral-800"
                    >
                      View Plans
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Quota & Usage Metering */}
        <Card id="billing-usage-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Current Usage & Tier Allocations</CardTitle>
                  <CardDescription className="text-xs">
                    Monthly usage counters reset on the 1st of each calendar month.
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={loadBillingData} disabled={isLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* API Requests */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700">API Requests</span>
                  <span className="font-mono text-[11px] text-neutral-500">
                    {usageSummary?.breakdown.apiRequests.used ?? 0} / {planLimits?.monthlyApiRequests?.toLocaleString() ?? '1,000'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        usageSummary?.breakdown.apiRequests.percentage ?? 0
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Rate limit: {planLimits?.apiRateLimitPerMinute ?? 15} req/min
                </span>
              </div>

              {/* AI Requests */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700">AI Prompt Optimizations</span>
                  <span className="font-mono text-[11px] text-neutral-500">
                    {usageSummary?.breakdown.aiRequests.used ?? 0} / {planLimits?.monthlyAiRequests?.toLocaleString() ?? '50'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        usageSummary?.breakdown.aiRequests.percentage ?? 0
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Max tokens: {planLimits?.maxAiOutputTokens ?? 1500} tokens
                </span>
              </div>

              {/* Active API Keys */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700">Active API Keys</span>
                  <span className="font-mono text-[11px] text-neutral-500">
                    {planLimits?.maxActiveApiKeys ?? 2} keys allowed
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '20%' }} />
                </div>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Payload limit: {((planLimits?.maxInputPayloadBytes ?? 262144) / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-neutral-100 text-xs text-neutral-500">
            <span>Need higher team quotas or expanded concurrency allocations?</span>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/contact')} className="text-xs">
              Contact Sales
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};
