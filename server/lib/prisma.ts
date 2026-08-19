/**
 * ByGoodAI Server - Prisma Client Singleton
 * Server-only database connection manager with graceful error isolation
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

declare global {
  // Prevent multiple instances of Prisma Client in development with HMR/restarts
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

/**
 * Ensures PostgreSQL unix domain socket symlinks exist in /tmp
 * for Cloud SQL instances running behind unix domain sockets.
 */
function resolveDatabaseUrl(): string | undefined {
  const sqlHost = process.env.SQL_HOST;
  const sqlUser = process.env.SQL_USER;
  const sqlPassword = process.env.SQL_PASSWORD;
  const sqlDb = process.env.SQL_DB_NAME || 'cloud_sql_development_database';

  if (sqlHost && sqlUser && sqlPassword) {
    try {
      const sourceSocket = path.join(sqlHost, '.s.PGSQL.5432');
      const targetSocket = '/tmp/.s.PGSQL.5432';

      if (fs.existsSync(sourceSocket) && !fs.existsSync(targetSocket)) {
        fs.symlinkSync(sourceSocket, targetSocket);
      }
    } catch {
      // Ignore symlink errors if already existing or permissions are restricted
    }

    return `postgresql://${encodeURIComponent(sqlUser)}:${encodeURIComponent(sqlPassword)}@localhost/${sqlDb}?host=/tmp`;
  }

  return process.env.DATABASE_URL;
}

const resolvedDbUrl = resolveDatabaseUrl();

export const prisma =
  global.__prismaClient ||
  new PrismaClient({
    datasources: resolvedDbUrl ? { db: { url: resolvedDbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}

export interface DbStatus {
  connected: boolean;
  latencyMs: number;
  message?: string;
}

/**
 * Checks database connectivity with low-latency ping query
 */
export async function checkDatabaseHealth(): Promise<DbStatus> {
  const start = Date.now();
  try {
    // Quick raw query to verify database is reachable
    await prisma.$queryRawUnsafe('SELECT 1 as ping');
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      message: 'PostgreSQL database unreachable or DATABASE_URL is not connected',
    };
  }
}
