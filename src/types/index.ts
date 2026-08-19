/**
 * ByGoodAI Platform - Core TypeScript Types & Interfaces
 */

export * from './toolEngine';

export type UserRole = 'USER' | 'ADMIN';
export type UserPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  plan: UserPlan;
  emailVerified?: string | null;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
  profile?: {
    displayName?: string | null;
    bio?: string | null;
    preferences?: UserPreferences;
  } | null;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  autoSaveHistory: boolean;
  defaultToolCategory?: string;
  compactView: boolean;
}

export interface AuthResponse {
  user: User;
  message?: string;
}


export interface ToolCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
  toolCount: number;
}

export type ToolDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ToolTag = 'AI' | 'DEVELOPER' | 'FORMATTER' | 'SECURITY' | 'DATA' | 'SEO' | 'DESIGN' | 'UTILITY';

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string; // matches ToolCategory.slug
  icon: string;
  tags: ToolTag[];
  isPopular?: boolean;
  isNew?: boolean;
  isPro?: boolean;
  usageCount: number;
  rating: number;
  averageExecutionMs: number;
  inputPlaceholder?: string;
  sampleInput?: string;
  defaultOptions?: Record<string, any>;
  documentation?: {
    overview: string;
    howToUse: string[];
    features: string[];
    faq: Array<{ question: string; answer: string }>;
  };
}

export interface ToolExecutionResult {
  success: boolean;
  output: string;
  metadata?: Record<string, any>;
  executionTimeMs: number;
  error?: string;
  details?: string;
  warnings?: string[];
  byteSize?: {
    input: number;
    output: number;
  };
}

export interface ToolHistoryItem {
  id: string;
  toolId?: string;
  toolSlug: string;
  toolName?: string;
  category?: string;
  inputSnippet?: string;
  outputSnippet?: string;
  inputPayload?: string;
  outputPayload?: string;
  status?: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | string;
  timestamp?: string;
  createdAt?: string;
  executionTimeMs: number;
  isSuccess?: boolean;
}

export type HistoryItem = ToolHistoryItem;

export interface SavedItem {
  id: string;
  toolId: string;
  toolSlug: string;
  title: string;
  notes?: string;
  savedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTimeMinutes: number;
  coverImage?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface SystemMetrics {
  totalTools: number;
  totalCategories: number;
  totalExecutions: number;
  averageLatencyMs: number;
  uptimePercentage: number;
  activeUsers24h: number;
  serverVersion: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  isExternal?: boolean;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}
