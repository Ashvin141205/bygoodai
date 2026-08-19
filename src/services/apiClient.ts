/**
 * ByGoodAI Frontend - Centralized API Client
 * Type-safe HTTP fetch client with authentication header injection and structured error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  public code: string;
  public details?: any;
  public statusCode: number;

  constructor(message: string, code = 'API_ERROR', statusCode = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Automatically sends HTTP-only session cookie
        headers,
      });

      const json: ApiResponse<T> = await response.json().catch(() => ({
        success: false,
        error: {
          code: 'INVALID_JSON_RESPONSE',
          message: `Server returned non-JSON response (HTTP ${response.status})`,
        },
      }));

      if (!response.ok || !json.success) {
        throw new ApiError(
          json.error?.message || `HTTP ${response.status}: Request failed`,
          json.error?.code || 'REQUEST_FAILED',
          response.status,
          json.error?.details
        );
      }

      return json.data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err.message || 'Network error connecting to ByGoodAI server',
        'NETWORK_ERROR',
        0
      );
    }
  }


  public async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
