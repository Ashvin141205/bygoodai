/**
 * ByGoodAI Frontend - User Profile View
 * Displays authenticated user account details, tier status, usage metrics,
 * and allows updating display name and developer preferences.
 */

import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { SEOHead } from '../components/seo/SEOHead';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export interface ProfileViewProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  // If not authenticated, render pleasant sign-in prompt
  if (!isAuthenticated && !isLoading) {
    return (
      <>
        <SEOHead
          title="Account Profile | ByGoodAI"
          description="View and manage your developer profile, tier credentials, and workspace preferences."
          canonicalPath="/profile"
          robots="noindex,nofollow"
          isPrivate={true}
        />
        <PageContainer
          title="Account Profile"
          description="View and manage your developer profile, tier credentials, and workspace preferences."
          breadcrumbs={[{ label: 'Profile', current: true }]}
          onNavigate={onNavigate}
        >
          <div className="max-w-md mx-auto my-12 text-center space-y-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
              <UserIcon className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900">Authentication Required</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Please sign in to access your personal profile, cloud-synchronized execution logs, and account settings.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => onNavigate('/')}>
                Return Home
              </Button>
              <Button variant="primary" size="sm" onClick={() => onOpenAuth('login')}>
                Sign In
              </Button>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <>
      <SEOHead
        title="Developer Profile | ByGoodAI"
        description="Manage your identity, view subscription entitlements, and configure account details."
        canonicalPath="/profile"
        robots="noindex,nofollow"
        isPrivate={true}
      />
      <PageContainer
        title="Developer Profile"
        description="Manage your identity, view subscription entitlements, and configure account details."
        breadcrumbs={[{ label: 'Profile', current: true }]}
        onNavigate={onNavigate}
      >

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white font-extrabold text-xl shadow-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                      {user?.name || 'Developer'}
                    </h2>
                    <Badge variant={user?.plan === 'PRO' ? 'indigo' : 'secondary'} size="sm">
                      {user?.plan} Plan
                    </Badge>
                    {user?.role === 'ADMIN' && (
                      <Badge variant="error" size="sm">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 font-mono flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-neutral-400" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('/settings')}
                  className="flex-1 sm:flex-none"
                >
                  Workspace Settings
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('/pricing')}
                  className="flex-1 sm:flex-none"
                >
                  Upgrade Tier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSave} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    required
                  />

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full rounded-lg border border-neutral-200 bg-neutral-100/70 py-2 pl-3 pr-24 text-xs text-neutral-600 font-mono cursor-not-allowed"
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-neutral-400 font-semibold">
                        Primary (Fixed)
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Email address changes require secure verification in the upcoming Phase 7.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Bio / Developer Tagline
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Full-stack TypeScript architect & systems enthusiast"
                      rows={3}
                      className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <Button variant="primary" type="submit" isLoading={isSaving}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Overview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-neutral-400" />
                    Security Level
                  </span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Bcrypt (Work 12)
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    Member Since
                  </span>
                  <span className="font-mono text-neutral-700">{formattedDate}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-neutral-400" />
                    Plan Tier
                  </span>
                  <span className="font-bold text-neutral-900">{user?.plan}</span>
                </div>

                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 text-[11px] text-neutral-600 space-y-1.5">
                  <span className="font-bold text-neutral-900 block">Zero-Telemetry Policy</span>
                  <p className="leading-relaxed text-neutral-500">
                    Your code inputs and execution results are processed locally in your browser sandbox.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
    </>
  );
};
