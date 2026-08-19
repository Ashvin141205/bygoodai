import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { APP_CONFIG } from '../config/app.config';
import { ShieldCheck, Mail, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export interface LegalViewProps {
  type: 'privacy' | 'terms' | 'about' | 'contact' | 'faq';
  onNavigate: (path: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onNavigate }) => {
  const { showToast } = useToast();

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Message sent to the engineering team', 'success');
    }, 600);
  };

  const configs = {
    privacy: {
      title: 'Privacy Policy & Zero-Telemetry Guarantee',
      desc: 'Our strict client-first, in-memory data processing guarantees.',
      breadcrumbs: [{ label: 'Privacy Policy', current: true }],
      content: (
        <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Zero Server-Side Ingestion</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                We believe developer utilities should respect source code and secret privacy. All JSON formatting, regex analysis, JWT decoding, and hash calculations occur directly in client memory.
              </p>
            </div>
          </div>

          <h3 className="font-bold text-neutral-900 text-sm">1. Scope of In-Memory Processing</h3>
          <p>
            {APP_CONFIG.name} executes all core developer utilities (including formatters, parsers, validators, encoders, and hashing functions) directly within the browser runtime. Input payloads, bearer tokens, and confidential JSON structures are never transmitted to or stored on external backend servers.
          </p>

          <h3 className="font-bold text-neutral-900 text-sm">2. Local Storage Usage</h3>
          <p>
            Any saved history items, bookmarked developer tools, and customization preferences are stored strictly inside your browser&apos;s local storage (`localStorage`). You have complete authority to inspect or purge this data at any time from the Workstation Dashboard.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      desc: 'Platform terms, allowable developer usage, and service reliability.',
      breadcrumbs: [{ label: 'Terms of Service', current: true }],
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <p>
            By accessing {APP_CONFIG.name}, you agree to utilize our developer utilities in compliance with applicable software and internet laws.
          </p>
          <h3 className="font-bold text-neutral-900 pt-2 text-sm">Permitted Developer Use</h3>
          <p>
            You are free to format, evaluate, convert, and inspect payloads for personal, educational, and commercial software development purposes without restriction.
          </p>
        </div>
      ),
    },
    about: {
      title: `About ${APP_CONFIG.name}`,
      desc: 'Building responsive, client-side software engineering utilities.',
      breadcrumbs: [{ label: 'About', current: true }],
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <p>
            {APP_CONFIG.name} was created by engineers who were tired of ad-heavy, slow, and insecure web tools that leak confidential JSON payloads and API keys.
          </p>
          <p>
            We built ByGoodAI to give every software team a unified, beautiful, sub-5ms workstation with instant copy, hotkeys, file exports, and clean REST integration.
          </p>
        </div>
      ),
    },
    contact: {
      title: 'Contact Engineering',
      desc: 'Reach out for technical questions, enterprise inquiries, or tool suggestions.',
      breadcrumbs: [{ label: 'Contact', current: true }],
      content: (
        <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          {isSubmitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-950">Message Transmitted</h4>
              <p className="text-xs text-emerald-800">
                Thank you for contacting ByGoodAI engineering. A member of our core developer team will review your inquiry shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSubmitted(false);
                  setContactName('');
                  setContactEmail('');
                  setContactSubject('');
                  setContactMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  placeholder="e.g. Alex Chen"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="alex@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Subject"
                placeholder="Feature request, enterprise inquiry, or bug report"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Message Payload *</label>
                <textarea
                  rows={5}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your inquiry, suggestion, or question in detail..."
                  className="w-full rounded-xl border border-neutral-300 bg-white p-3 font-sans text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Submit Inquiry
              </Button>
            </form>
          )}

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-600 space-y-1 pt-4">
            <p><strong>Direct Inquiries:</strong></p>
            <p>engineering: core@bygoodai.example</p>
            <p>enterprise: enterprise@bygoodai.example</p>
          </div>
        </div>
      ),
    },
    faq: {
      title: 'Frequently Asked Questions',
      desc: 'Everything you need to know about the platform.',
      breadcrumbs: [{ label: 'FAQ', current: true }],
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h4 className="font-bold text-neutral-900 text-sm">Is my data secure?</h4>
          <p className="text-xs">Yes, 100% of formatting, hashing, and regex processing runs client-side in your browser memory.</p>

          <h4 className="font-bold text-neutral-900 pt-2 text-sm">Can I request a new tool?</h4>
          <p className="text-xs">Yes! Send our core team a note via the Contact form or open a pull request on our repository.</p>
        </div>
      ),
    },
  };

  const current = configs[type] || configs.about;

  return (
    <PageContainer
      title={current.title}
      description={current.desc}
      breadcrumbs={current.breadcrumbs}
      onNavigate={onNavigate}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-neutral-200/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            {current.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">{current.desc}</p>
        </div>
        <Card>
          <CardContent className="p-6 sm:p-8">{current.content}</CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
