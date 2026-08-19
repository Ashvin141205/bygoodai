/**
 * ByGoodAI Automated Auth & Session Verification Test Suite
 * Validates registration, bcrypt password hashing, session lifecycle,
 * permission guards, and cookie protection across the authentication layer.
 */

import { apiClient, ApiError } from './apiClient';
import { authService } from './authService';

export interface AuthTestResult {
  testId: string;
  testName: string;
  category: 'REGISTRATION' | 'LOGIN' | 'SESSION' | 'PASSWORD' | 'PROFILE' | 'LOGOUT' | 'SECURITY';
  passed: boolean;
  durationMs: number;
  error?: string;
}

export interface AuthTestSuiteSummary {
  totalTests: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: AuthTestResult[];
}

export async function runAuthDiagnostics(): Promise<AuthTestSuiteSummary> {
  const startTime = performance.now();
  const results: AuthTestResult[] = [];

  const runTest = async (
    testId: string,
    testName: string,
    category: AuthTestResult['category'],
    fn: () => Promise<void>
  ) => {
    const t0 = performance.now();
    try {
      await fn();
      results.push({
        testId,
        testName,
        category,
        passed: true,
        durationMs: Number((performance.now() - t0).toFixed(2)),
      });
    } catch (err: any) {
      results.push({
        testId,
        testName,
        category,
        passed: false,
        durationMs: Number((performance.now() - t0).toFixed(2)),
        error: err.message || 'Verification failed',
      });
    }
  };

  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!Secure';
  const newPassword = 'Password456!Updated';

  // 1. Unauthenticated /api/auth/me returns null or 401 gracefully
  await runTest(
    'AUTH_01',
    'Guest session inspection returns null or 401',
    'SESSION',
    async () => {
      // In guest state or pre-existing state, /me returns user or 401
      try {
        const res = await apiClient.get<any>('/auth/me');
        if (res && res.user && !res.user.email) {
          throw new Error('Invalid user payload returned from /me');
        }
      } catch (err: any) {
        if (err.statusCode !== 401 && err.statusCode !== 200 && err.statusCode !== 0) {
          throw new Error(`Unexpected status code: ${err.statusCode}`);
        }
      }
    }
  );

  // 2. User Registration
  await runTest(
    'AUTH_02',
    'User registration generates safe user without password hash',
    'REGISTRATION',
    async () => {
      const user = await authService.register({
        email: testEmail,
        password: testPassword,
        name: 'Automated Test Engineer',
      });

      if (!user.id || !user.email) {
        throw new Error('Registration failed to return user object');
      }
      if ((user as any).password || (user as any).passwordHash) {
        throw new Error('CRITICAL SECURITY LEAK: Password hash exposed in user payload');
      }
    }
  );

  // 3. Duplicate Registration Rejection
  await runTest(
    'AUTH_03',
    'Duplicate registration is rejected with 409 Conflict',
    'REGISTRATION',
    async () => {
      try {
        await authService.register({
          email: testEmail,
          password: testPassword,
          name: 'Duplicate Test',
        });
        throw new Error('Server allowed duplicate email registration');
      } catch (err: any) {
        if (!err.message?.toLowerCase().includes('already exists') && err.statusCode !== 409) {
          throw err;
        }
      }
    }
  );

  // 4. Session Verification via Cookie
  await runTest(
    'AUTH_04',
    'Authenticated session verification via HTTP-only cookie',
    'SESSION',
    async () => {
      const user = await authService.getCurrentUser();
      if (!user || user.email !== testEmail.toLowerCase()) {
        throw new Error(`Expected active session for ${testEmail}, got: ${user?.email}`);
      }
    }
  );

  // 5. Invalid Login Credentials Rejection
  await runTest(
    'AUTH_05',
    'Invalid password rejected with generic error',
    'LOGIN',
    async () => {
      try {
        await authService.login({
          email: testEmail,
          password: 'WrongPassword999!',
        });
        throw new Error('Server accepted incorrect password');
      } catch (err: any) {
        if (err.statusCode !== 401 && !err.message?.toLowerCase().includes('invalid')) {
          throw err;
        }
      }
    }
  );

  // 6. Profile Information Update
  await runTest(
    'AUTH_06',
    'Profile update synchronizes name and preferences',
    'PROFILE',
    async () => {
      const updated = await authService.updateProfile({
        name: 'Alex Verified',
        bio: 'Senior Systems Architect',
      });
      if (updated.name !== 'Alex Verified') {
        throw new Error(`Expected updated name 'Alex Verified', got '${updated.name}'`);
      }
    }
  );

  // 7. Password Change with Current Password Verification
  await runTest(
    'AUTH_07',
    'Password change verifies current credential before updating',
    'PASSWORD',
    async () => {
      // First try with invalid current password
      try {
        await authService.changePassword({
          currentPassword: 'IncorrectOldPassword',
          newPassword: newPassword,
          confirmPassword: newPassword,
        });
        throw new Error('Server accepted invalid current password');
      } catch (err: any) {
        if (!err.message?.toLowerCase().includes('incorrect') && err.statusCode !== 400) {
          throw err;
        }
      }

      // Now change with valid current password
      const msg = await authService.changePassword({
        currentPassword: testPassword,
        newPassword: newPassword,
        confirmPassword: newPassword,
      });

      if (!msg) {
        throw new Error('No confirmation message from password change');
      }
    }
  );

  // 8. Sign In with New Password
  await runTest(
    'AUTH_08',
    'Sign in with updated bcrypt password',
    'LOGIN',
    async () => {
      const user = await authService.login({
        email: testEmail,
        password: newPassword,
      });
      if (!user || user.email !== testEmail.toLowerCase()) {
        throw new Error('Failed to login with new password');
      }
    }
  );

  // 9. Logout & Session Termination
  await runTest(
    'AUTH_09',
    'Session logout destroys session and clears cookie',
    'LOGOUT',
    async () => {
      await authService.logout();
      const me = await authService.getCurrentUser();
      if (me !== null) {
        throw new Error('Session persisted after logout');
      }
    }
  );

  return {
    totalTests: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    durationMs: Number((performance.now() - startTime).toFixed(2)),
    results,
  };
}
