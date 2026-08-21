/**
 * ByGoodAI Frontend - Workspace & Account Settings View
 * Provides working settings for credential management (Change Password),
 * Developer API Key generation & revocation, editor appearance, and session inspection.
 */

import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { SEOHead } from '../components/seo/SEOHead';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { apiKeyClientService, ApiKeyItem } from '../services/apiKeyService';
import { copyToClipboard } from '../lib/utils';
import {
  KeyRound,
  Shield,
  Palette,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Trash2,
  Sliders,
  Moon,
  Sun,
  Laptop,
  Plus,
  Copy,
  Check,
  Code2,
  Terminal,
  Clock,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';

export interface SettingsViewProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, isLoading, changePassword, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Appearance & Preferences State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [compactView, setCompactView] = useState(false);
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiryDays, setNewKeyExpiryDays] = useState<number | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [createKeyError, setCreateKeyError] = useState<string | null>(null);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadApiKeys();
    }
  }, [isAuthenticated]);

  const loadApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const keys = await apiKeyClientService.listKeys();
      setApiKeys(keys);
    } catch (err: any) {
      console.warn('Failed to load API keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateKeyError(null);

    if (!newKeyName.trim()) {
      setCreateKeyError('Please provide a descriptive name for your API key.');
      return;
    }

    setIsGeneratingKey(true);
    try {
      const result = await apiKeyClientService.createKey({
        name: newKeyName.trim(),
        expiresInDays: newKeyExpiryDays,
      });

      setCreatedRawKey(result.rawKey);
      setApiKeys([result.apiKey, ...apiKeys.filter((k) => k.id !== result.apiKey.id)]);
      setNewKeyName('');
      setNewKeyExpiryDays(null);
      showToast('API key successfully generated!', 'success');
    } catch (err: any) {
      setCreateKeyError(err.message || 'Failed to generate API key.');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using this key will immediately lose access.')) {
      return;
    }

    setRevokingKeyId(keyId);
    try {
      const revoked = await apiKeyClientService.revokeKey(keyId);
      setApiKeys(apiKeys.map((k) => (k.id === keyId ? revoked : k)));
      showToast('API key revoked', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke API key.', 'error');
    } finally {
      setRevokingKeyId(null);
    }
  };

  const handleCopySecretKey = async () => {
    if (!createdRawKey) return;
    const ok = await copyToClipboard(createdRawKey);
    if (ok) {
      setHasCopiedKey(true);
      showToast('API key copied to clipboard!', 'success');
      setTimeout(() => setHasCopiedKey(false), 3000);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <>
        <SEOHead
          title="Workspace Settings | ByGoodAI"
          description="Configure account credentials, developer security, and workstation preferences."
          canonicalPath="/settings"
          robots="noindex,nofollow"
          isPrivate={true}
        />
        <PageContainer
          title="Workspace Settings"
          description="Configure account credentials, developer security, and workstation preferences."
          breadcrumbs={[{ label: 'Settings', current: true }]}
          onNavigate={onNavigate}
        >
          <div className="max-w-md mx-auto my-12 text-center space-y-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
              <Sliders className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900">Sign in to configure settings</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Account settings, API keys, and session security are tied to your authenticated developer workspace.
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


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updateProfile({
        preferences: {
          theme,
          compactView,
          autoSaveHistory,
        },
      });
      showToast('Workstation preferences saved', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save preferences', 'error');
    }
  };

  return (
    <>
      <SEOHead
        title="Workspace Settings | ByGoodAI"
        description="Configure account security, developer API keys, editor layout, and privacy preferences."
        canonicalPath="/settings"
        robots="noindex,nofollow"
        isPrivate={true}
      />
      <PageContainer
        title="Workspace Settings"
        description="Configure account security, developer API keys, editor layout, and privacy preferences."
        breadcrumbs={[{ label: 'Settings', current: true }]}
        onNavigate={onNavigate}
      >

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section 0: Billing & Subscription Overview */}
        <Card id="settings-billing-section">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">Billing & Subscription</CardTitle>
                    <Badge variant={user?.plan === 'ENTERPRISE' ? 'indigo' : user?.plan === 'PRO' ? 'default' : 'secondary'} size="sm">
                      {user?.plan || 'FREE'} PLAN
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    View active quotas, upgrade to Pro, manage credit cards, and download invoices.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('/billing')}
                  className="flex items-center gap-1.5"
                >
                  <span>Manage Billing</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                </Button>
                {user?.plan === 'FREE' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('/pricing')}
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Section 1: Developer API Keys */}
        <Card id="api-keys-section">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Developer API Keys</CardTitle>
                  <CardDescription className="text-xs">
                    Generate secret Bearer keys to access the ByGoodAI Developer API (<code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">/api/v1</code>).
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCreatedRawKey(null);
                  setCreateKeyError(null);
                  setIsCreateKeyModalOpen(true);
                }}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Generate New Key
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {isLoadingKeys ? (
              <div className="py-8 text-center text-xs text-neutral-500">Loading API keys...</div>
            ) : apiKeys.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center space-y-2">
                <p className="text-xs font-semibold text-neutral-800">No active API keys</p>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  Create an API key to execute formatters, regex analyzers, and AI prompt architects directly in your CI/CD pipelines and scripts.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-neutral-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{key.name}</span>
                        <Badge
                          variant={
                            key.status === 'ACTIVE'
                              ? 'success'
                              : key.status === 'REVOKED'
                              ? 'secondary'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">{key.keyPrefix}</span>
                        <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                        {key.expiresAt && (
                          <span className="text-neutral-400">
                            Expires {new Date(key.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                        {key.lastUsedAt && (
                          <span className="text-neutral-400">
                            Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {key.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeKey(key.id)}
                          isLoading={revokingKeyId === key.id}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-neutral-500" />
                <span>Need quick integration examples? Check out the API documentation.</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('/docs')}>
                View API Docs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Security & Password Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Security & Password</CardTitle>
                <CardDescription className="text-xs">
                  Update your authentication credentials. Uses Bcrypt salt hashing with work factor 12.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {passwordError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">{passwordError}</div>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-lg border border-neutral-200 bg-white py-2 px-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button variant="primary" type="submit" isLoading={isChangingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Section 3: Workstation Appearance & Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Appearance & Execution</CardTitle>
                <CardDescription className="text-xs">
                  Customize the workstation editor ergonomics and telemetry recording.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">Theme Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
                  { id: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
                  { id: 'system', label: 'System Auto', icon: <Laptop className="h-4 w-4" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as any)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      theme === item.id
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Auto-Save Tool Execution History
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Persist execution logs and timing telemetry to your private workstation database.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSaveHistory}
                  onChange={(e) => setAutoSaveHistory(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Compact Workstation Layout
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Reduces vertical padding for dense code and regex inspection.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={compactView}
                  onChange={(e) => setCompactView(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </label>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button variant="outline" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Privacy & Session Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Privacy & Session Management</CardTitle>
                <CardDescription className="text-xs">
                  Active authentication session and privacy controls.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Encrypted HTTP-Only Session Active</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Your session token is securely isolated in an HTTP-only, SameSite cookie protected against cross-site scripting (XSS).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500">Sign out of this device and invalidate current session</span>
              <Button variant="destructive" size="sm" onClick={() => logout()}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Generate New API Key */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  {createdRawKey ? 'API Key Generated' : 'Create Developer API Key'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateKeyModalOpen(false);
                  setCreatedRawKey(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createdRawKey ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Store this key safely!</strong>
                    <span>For your security, this secret API key will never be shown again.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">Secret API Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdRawKey}
                      className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-900 select-all"
                    />
                    <Button
                      variant={hasCopiedKey ? 'primary' : 'outline'}
                      size="sm"
                      onClick={handleCopySecretKey}
                      className="shrink-0"
                    >
                      {hasCopiedKey ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsCreateKeyModalOpen(false);
                      setCreatedRawKey(null);
                    }}
                  >
                    I have saved my key
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                {createKeyError && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{createKeyError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">Key Name / Identifier</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. CI/CD Deployment Pipeline, Local Dev"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">Expiration Period</label>
                  <select
                    value={newKeyExpiryDays === null ? 'never' : String(newKeyExpiryDays)}
                    onChange={(e) =>
                      setNewKeyExpiryDays(e.target.value === 'never' ? null : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="never">No Expiration (Never)</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year (365 Days)</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setIsCreateKeyModalOpen(false);
                      setCreatedRawKey(null);
                      setCreateKeyError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" isLoading={isGeneratingKey}>
                    Generate Key
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageContainer>
    </>
  );
};
