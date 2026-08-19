/**
 * ByGoodAI Frontend - Real Authentication & Session Modal
 * Supports seamless Sign In and Account Registration with client validation,
 * password visibility toggling, password strength indicators, and accessible form controls.
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChange,
  initialMode = 'login',
}) => {
  const { login, register, isAuthenticated, user, logout } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form state when switching mode
  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
  };

  // Password strength calculation for registration
  const calculatePasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-neutral-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: trimmedEmail, password });
      } else {
        await register({ email: trimmedEmail, password, name: name.trim() });
      }

      onUserChange?.();
      onClose();
      // Clear fields
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      onUserChange?.();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAuthenticated
          ? 'Active Developer Session'
          : mode === 'login'
          ? 'Sign in to ByGoodAI'
          : 'Create your ByGoodAI account'
      }
      description={
        isAuthenticated
          ? 'Manage your active workspace identity and security credentials.'
          : mode === 'login'
          ? 'Access your cloud workspace, persistent execution telemetry, and saved tools.'
          : 'Join developers using local browser execution and developer utilities.'
      }
      maxWidth="md"
    >
      {/* If already authenticated, show quick account details & sign out */}
      {isAuthenticated && user ? (
        <div className="space-y-5 mt-2">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-sm">
                {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900">{user.name || 'Developer'}</div>
                <div className="text-xs text-neutral-500 font-mono">{user.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/70 text-xs">
              <div>
                <span className="text-neutral-500">Plan Tier:</span>{' '}
                <span className="font-semibold text-neutral-900">{user.plan}</span>
              </div>
              <div>
                <span className="text-neutral-500">Role:</span>{' '}
                <span className="font-semibold text-neutral-900">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={handleSignOut}
              isLoading={isLoading}
            >
              Sign Out
            </Button>
          </div>
        </div>
      ) : (
        /* Sign In / Register Form */
        <div className="space-y-4 mt-2">
          {/* Mode Switch Tabs */}
          <div className="flex rounded-lg bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 animate-in fade-in duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Registration */}
            {mode === 'register' && (
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                autoComplete="name"
                leftIcon={<UserIcon className="h-4 w-4 text-neutral-400" />}
                required
              />
            )}

            {/* Email Field */}
            <Input
              label="Work or Personal Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
              required
            />

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 8 characters with letters & numbers' : '••••••••'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter for Register Mode */}
              {mode === 'register' && password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-neutral-700">{passwordStrength.label}</span>
                  </div>
                  <div className="flex h-1 w-full gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          step <= passwordStrength.score ? passwordStrength.color : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Privacy & Security Note */}
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-neutral-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Sessions are protected with HTTP-only cookies and bcrypt hashing. Your execution history stays private to your account.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
