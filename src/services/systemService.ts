/**
 * ByGoodAI Frontend - System Diagnostics Service Layer
 */

import { apiClient } from './apiClient';

export interface SystemHealthData {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    status: 'connected' | 'disconnected';
    latencyMs: number;
    note?: string;
  };
  system: {
    memoryHeapUsedMb: number;
    memoryHeapTotalMb: number;
  };
}

class SystemService {
  public async getHealth(): Promise<SystemHealthData> {
    try {
      const data = await apiClient.get<SystemHealthData>('/health');
      return data;
    } catch (err: any) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptimeSeconds: 0,
        environment: 'browser-offline',
        database: {
          status: 'disconnected',
          latencyMs: 0,
          note: err.message || 'API endpoint unreachable',
        },
        system: {
          memoryHeapUsedMb: 0,
          memoryHeapTotalMb: 0,
        },
      };
    }
  }
}

export const systemService = new SystemService();
