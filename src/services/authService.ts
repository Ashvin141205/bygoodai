/**
 * ByGoodAI Frontend - Authentication & User Account Service
 * Provides typed methods for registration, session login, logout, and credential management.
 */

import { apiClient } from './apiClient';
import { User, AuthResponse } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  preferences?: any;
}

class AuthService {
  /**
   * Registers a new user account with secure server-side session initialization
   */
  public async register(payload: RegisterPayload): Promise<User> {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return res.user;
  }

  /**
   * Signs in user with email and password credentials
   */
  public async login(payload: LoginPayload): Promise<User> {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.user;
  }

  /**
   * Destroys current session on the server and clears HTTP-only cookies
   */
  public async logout(): Promise<void> {
    await apiClient.post<{ message: string }>('/auth/logout');
  }

  /**
   * Retrieves current authenticated user context from session cookie
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const res = await apiClient.get<{ user: User }>('/auth/me');
      return res.user;
    } catch {
      return null;
    }
  }

  /**
   * Updates user password and revokes other active sessions
   */
  public async changePassword(payload: ChangePasswordPayload): Promise<string> {
    const res = await apiClient.post<{ message: string }>('/auth/change-password', payload);
    return res.message;
  }

  /**
   * Updates profile display information and developer preferences
   */
  public async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await apiClient.patch<{ user: User; message: string }>('/auth/profile', payload);
    return res.user;
  }
}

export const authService = new AuthService();
