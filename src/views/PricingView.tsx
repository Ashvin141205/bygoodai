import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { billingClientService, BillingConfigData } from '../services/billingClientService';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Check, Smartphone } from 'lucide-react';

export interface PricingViewProps {
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onNavigate, onOpenAuth }) => {
  const { showToast } = useToast();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [billingConfig, setBillingConfig] = useState<BillingConfigData | null>(null);

  const currentPlan = user?.plan || 'FREE';

  useEffect(() => {
    billingClientService.getConfig().then(setBillingConfig).catch(() => null);
  }, []);

  const handleSelectPlan = async (tier: string) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (tier === 'Community') {
      if (currentPlan === 'FREE') {
        showToast('You are currently on the Community Free Plan', 'info');
      } else {
        onNavigate('/billing');
      }
      return;
    }

    if (tier === 'Developer Pro') {
      if (currentPlan === 'PRO') {
        onNavigate('/billing');
        return;
      }

      setIsProcessingCheckout(true);
      try {
        const subData = await billingClientService.createSubscription('PRO', 12);

        if (!subData.subscriptionId || !subData.keyId) {
          throw new Error('Razorpay subscription initialization failed');
        }

        // Open Razorpay Standard Checkout
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
                showToast('Welcome to ByGoodAI Pro! Subscription activated.', 'success');
                onNavigate('/billing');
              }
            } catch (vErr: any) {
              showToast(vErr.message || 'Payment signature verification failed.', 'error');
            }
          },
          onDismiss: () => {
            showToast('Checkout window closed.', 'info');
          },
        });
      } catch (err: any) {
        showToast(
          err.message || 'Razorpay billing is not configured or failed to initialize.',
          'error'
        );
      } finally {
        setIsProcessingCheckout(false);
      }
      return;
    }

    if (tier === 'Enterprise') {
      if (currentPlan === 'ENTERPRISE') {
        onNavigate('/billing');
        return;
      }

      setIsProcessingCheckout(true);
      try {
        const subData = await billingClientService.createSubscription('ENTERPRISE', 12);

        if (!subData.subscriptionId || !subData.keyId) {
          throw new Error('Razorpay subscription initialization failed');
        }

        await billingClientService.openCheckout({
          subscriptionId: subData.subscriptionId,
          keyId: subData.keyId,
          planName: 'Enterprise',
          userName: user?.name || undefined,
          userEmail: user?.email || undefined,
          onSuccess: async (paymentData) => {
            try {
              showToast('Verifying payment signature with server...', 'info');
              const verifyRes = await billingClientService.verifyPayment(paymentData);
              if (verifyRes.verified) {
                await refreshUser?.();
                showToast('Welcome to ByGoodAI Enterprise! Subscription activated.', 'success');
                onNavigate('/billing');
              }
            } catch (vErr: any) {
              showToast(vErr.message || 'Payment signature verification failed.', 'error');
            }
          },
          onDismiss: () => {
            showToast('Checkout window closed.', 'info');
          },
        });
      } catch (err: any) {
        showToast(
          err.message || 'Enterprise subscription initialization failed.',
          'error'
        );
      } finally {
        setIsProcessingCheckout(false);
      }
    }
  };

  const proPrice = billingConfig?.plans?.pro?.priceMonthly ?? 199;
  const entPrice = billingConfig?.plans?.enterprise?.priceMonthly ?? 999;

  const plans = [
    {
      name: 'Community Free',
      tier: 'Community',
      price: '₹0',
      period: 'forever',
      description: 'Essential developer workstation with unlimited local executions and lightweight API access.',
      features: [
        'Unlimited local client-side tool executions',
        '2 active Developer API keys (/api/v1)',
        '1,000 automated API requests / month',
        '50 AI prompt optimizations / month',
        '15 requests / minute rate limit',
        '256 KB max input payload size',
      ],
      cta: isAuthenticated && currentPlan === 'FREE' ? 'Current Plan' : 'Get Started Free',
      popular: false,
    },
    {
      name: 'Developer Pro',
      tier: 'Developer Pro',
      price: `₹${proPrice}`,
      period: '/ month',
      description: 'Engineered for power users needing higher API throughput, AI capacity, and expanded keys.',
      features: [
        'Everything in Community Free',
        '10 active Developer API keys',
        '50,000 automated API requests / month',
        '1,000 AI prompt optimizations / month',
        '60 requests / minute rate limit',
        '5 MB max input payload size',
        'Priority tool execution pipeline',
      ],
      cta:
        isAuthenticated && currentPlan === 'PRO'
          ? 'Manage Subscription'
          : isProcessingCheckout
          ? 'Opening Razorpay...'
          : 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      tier: 'Enterprise',
      price: `₹${entPrice}`,
      period: '/ month',
      description: 'Maximum quota allocations, expanded team API keys, and high-throughput execution limits.',
      features: [
        'Everything in Developer Pro',
        '50 active Developer API keys',
        '500,000 automated API requests / month',
        '10,000 AI prompt optimizations / month',
        '300 requests / minute rate limit',
        '25 MB max input payload size',
        'High-concurrency API allocation',
      ],
      cta: isAuthenticated && currentPlan === 'ENTERPRISE' ? 'Manage Subscription' : 'Upgrade to Enterprise',
      popular: false,
    },
  ];

  const breadcrumbItems = [{ name: 'Pricing', url: '/pricing' }];

  return (
    <>
      <SEOHead
        title="Transparent Developer Pricing & API Plans | ByGoodAI"
        description="Explore predictable ByGoodAI pricing plans. 100% free unlimited client-side developer workstation, plus Developer Pro and Enterprise API access."
        canonicalPath="/pricing"
        breadcrumbs={breadcrumbItems}
      />
      <PageContainer
        title="Transparent Developer Pricing Plans"
        description="Predictable, production-ready developer pricing for individuals and engineering teams."
        breadcrumbs={[{ label: 'Pricing', current: true }]}
        onNavigate={onNavigate}
      >
        <div className="space-y-12">
          {/* Visible Semantic Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="indigo" size="sm">
              <span className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                UPI / Google Pay / Cards / NetBanking via Razorpay
              </span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Simple, Transparent Developer Pricing
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            All core utilities remain 100% free and in-memory. Upgrade for automated REST APIs and high-volume AI capacity.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-700">
            Monthly Billing
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between p-6 sm:p-8 transition-all ${
                plan.popular
                  ? 'border-neutral-900 shadow-lg ring-1 ring-neutral-900'
                  : 'border-neutral-200/90'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900">{plan.name}</h3>
                  {plan.popular && <Badge variant="default" size="sm">Most Popular</Badge>}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-mono">
                    {plan.price}
                  </span>
                  <span className="text-xs text-neutral-500">{plan.period}</span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">{plan.description}</p>

                <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-neutral-700">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={isProcessingCheckout && (plan.tier === 'Developer Pro' || plan.tier === 'Enterprise')}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="max-w-4xl mx-auto space-y-6 pt-10 border-t border-neutral-200/80">
          <h2 className="text-xl font-bold text-neutral-900 text-center">Comprehensive Plan Comparison</h2>
          <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-mono">
                  <th className="p-3.5 pl-5">Capability / Metric</th>
                  <th className="p-3.5 text-center">Community Free</th>
                  <th className="p-3.5 text-center">Developer Pro</th>
                  <th className="p-3.5 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                <tr>
                  <td className="p-3.5 pl-5 font-semibold">Client-Side Tool Executions</td>
                  <td className="p-3.5 text-center font-mono">Unlimited</td>
                  <td className="p-3.5 text-center font-mono">Unlimited</td>
                  <td className="p-3.5 text-center font-mono">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-5 font-semibold">Monthly API Requests (/api/v1)</td>
                  <td className="p-3.5 text-center font-mono">1,000</td>
                  <td className="p-3.5 text-center font-mono">50,000</td>
                  <td className="p-3.5 text-center font-mono">500,000</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-5 font-semibold">API Rate Limits</td>
                  <td className="p-3.5 text-center font-mono">15 req/min</td>
                  <td className="p-3.5 text-center font-mono">60 req/min</td>
                  <td className="p-3.5 text-center font-mono">300 req/min</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-5 font-semibold">Monthly AI Prompt Optimizations</td>
                  <td className="p-3.5 text-center font-mono">50</td>
                  <td className="p-3.5 text-center font-mono">1,000</td>
                  <td className="p-3.5 text-center font-mono">10,000</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-5 font-semibold">Max Active API Keys</td>
                  <td className="p-3.5 text-center font-mono">2</td>
                  <td className="p-3.5 text-center font-mono">10</td>
                  <td className="p-3.5 text-center font-mono">50</td>
                </tr>
                <tr>
                  <td className="p-3.5 pl-5 font-semibold">Max Payload Size</td>
                  <td className="p-3.5 text-center font-mono">256 KB</td>
                  <td className="p-3.5 text-center font-mono">5 MB</td>
                  <td className="p-3.5 text-center font-mono">25 MB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
    </>
  );
};
