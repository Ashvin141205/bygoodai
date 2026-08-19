/**
 * ByGoodAI Frontend - Central Authentication Context & Provider
 * Manages reactive session authentication state, permission guards,
 * and user profile synchronization across views.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload, ChangePasswordPayload, UpdateProfilePayload } from '../services/authService';
import { useToast } from '../components/ui/Toast';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (credentials: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateProfile: (data: UpdateProfilePayload) => Promise<User>;
  changePassword: (data: ChangePasswordPayload) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // 1. Initial Session Inspection on App Mount
  const initializeAuth = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 2. Login Action
  const login = useCallback(async (credentials: LoginPayload): Promise<User> => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.name || loggedInUser.email}!`, 'success');
    return loggedInUser;
  }, [showToast]);

  // 3. Register Action
  const register = useCallback(async (credentials: RegisterPayload): Promise<User> => {
    const newUser = await authService.register(credentials);
    setUser(newUser);
    showToast(`Account created successfully. Welcome, ${newUser.name || 'Developer'}!`, 'success');
    return newUser;
  }, [showToast]);

  // 4. Logout Action
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      showToast('You have been signed out.', 'info');
    }
  }, [showToast]);

  // 5. Refresh User Context
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const refreshed = await authService.getCurrentUser();
      setUser(refreshed);
      return refreshed;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // 6. Profile Update
  const updateProfile = useCallback(async (data: UpdateProfilePayload): Promise<User> => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    showToast('Profile information updated successfully', 'success');
    return updated;
  }, [showToast]);

  // 7. Password Change
  const changePassword = useCallback(async (data: ChangePasswordPayload): Promise<string> => {
    const msg = await authService.changePassword(data);
    showToast(msg || 'Password updated successfully', 'success');
    return msg;
  }, [showToast]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isPro: user?.plan === 'PRO' || user?.plan === 'ENTERPRISE',
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
  }), [user, isLoading, login, register, logout, refreshUser, updateProfile, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
