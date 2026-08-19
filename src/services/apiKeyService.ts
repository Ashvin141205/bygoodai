/**
 * ByGoodAI Client - API Key Management Service
 * Calls server-side PostgreSQL-backed API key endpoints.
 */

export interface ApiKeyItem {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  isRevoked: boolean;
  isExpired: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface CreateApiKeyResponse {
  apiKey: ApiKeyItem;
  rawKey: string;
  warning: string;
}

export const apiKeyClientService = {
  /**
   * Fetch all API keys for the active user
   */
  async listKeys(): Promise<ApiKeyItem[]> {
    const res = await fetch('/api/api-keys', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch API keys.');
    }

    const json = await res.json();
    return json.data || [];
  },

  /**
   * Create a new API key. The raw secret key is returned only once.
   */
  async createKey(params: { name: string; expiresInDays?: number | null }): Promise<CreateApiKeyResponse> {
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to generate API key.');
    }

    const json = await res.json();
    return json.data;
  },

  /**
   * Revoke an active API key
   */
  async revokeKey(keyId: string): Promise<ApiKeyItem> {
    const res = await fetch(`/api/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to revoke API key.');
    }

    const json = await res.json();
    return json.data;
  },
};
