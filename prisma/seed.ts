/**
 * ByGoodAI Platform - Prisma Development Database Seeder
 * Populates initial development data safely and idempotently.
 * 
 * SAFETY RULES:
 * - Never drops tables or truncates production data.
 * - Uses upsert operations for idempotency.
 * - Does not hardcode plain-text passwords.
 * - Sets default user plans to FREE and roles according to environment configuration.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string | undefined {
  const sqlHost = process.env.SQL_HOST;
  const sqlUser = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
  const sqlPassword = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;
  const sqlDb = process.env.SQL_DB_NAME || 'cloud_sql_development_database';

  if (sqlHost && sqlUser && sqlPassword) {
    try {
      const sourceSocket = path.join(sqlHost, '.s.PGSQL.5432');
      const targetSocket = '/tmp/.s.PGSQL.5432';

      if (fs.existsSync(sourceSocket) && !fs.existsSync(targetSocket)) {
        fs.symlinkSync(sourceSocket, targetSocket);
      }
    } catch {
      // Ignore
    }

    return `postgresql://${encodeURIComponent(sqlUser)}:${encodeURIComponent(sqlPassword)}@localhost/${sqlDb}?host=/tmp`;
  }

  return process.env.DATABASE_URL;
}

const resolvedDbUrl = resolveDatabaseUrl();
const prisma = new PrismaClient({
  datasources: resolvedDbUrl ? { db: { url: resolvedDbUrl } } : undefined,
});

async function main() {
  console.log('🌱 Starting ByGoodAI development database seed...');

  // 1. Seed Optional Development Admin User if environment variables are provided
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail.trim().toLowerCase() },
      update: {
        role: 'ADMIN',
        plan: 'FREE', // Admin role is independent of subscription plan
      },
      create: {
        email: adminEmail.trim().toLowerCase(),
        name: 'ByGoodAI Admin',
        role: 'ADMIN',
        plan: 'FREE',
        passwordHash: adminPasswordHash,
        profile: {
          create: {
            displayName: 'ByGoodAI Admin',
            bio: 'Development administrator account.',
            preferences: {
              theme: 'system',
              autoSaveHistory: true,
              compactView: false,
            },
          },
        },
      },
    });
    console.log(`✅ Seeded admin user: ${adminUser.email} (Role: ${adminUser.role}, Plan: ${adminUser.plan})`);
  } else {
    console.log('ℹ️ SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set; skipping admin user creation.');
  }

  // 2. Seed Standard Development Test User (role: USER, plan: FREE)
  const devEmail = process.env.SEED_DEV_EMAIL || 'developer@bygoodai.example';
  const devPassword = process.env.SEED_DEV_PASSWORD;
  const devPasswordHash = devPassword ? await bcrypt.hash(devPassword, 12) : null;

  const devUser = await prisma.user.upsert({
    where: { email: devEmail.toLowerCase() },
    update: {
      name: 'Test Developer',
      role: 'USER',
      plan: 'FREE',
      ...(devPasswordHash ? { passwordHash: devPasswordHash } : {}),
    },
    create: {
      email: devEmail.toLowerCase(),
      name: 'Test Developer',
      role: 'USER',
      plan: 'FREE',
      passwordHash: devPasswordHash,
      profile: {
        create: {
          displayName: 'Test Developer',
          bio: 'Local development and integration testing account.',
          preferences: {
            theme: 'system',
            autoSaveHistory: true,
            defaultCategory: 'developer',
            compactView: false,
          },
        },
      },
    },
  });
  console.log(`✅ Seeded development user: ${devUser.email} (Role: ${devUser.role}, Plan: ${devUser.plan})`);

  // 3. Seed Blog Categories
  const catEngineering = await prisma.blogCategory.upsert({
    where: { slug: 'engineering' },
    update: {},
    create: {
      name: 'Engineering',
      slug: 'engineering',
      description: 'Technical deep-dives into compiler design, WASM execution, and client-side performance.',
    },
  });

  const catSecurity = await prisma.blogCategory.upsert({
    where: { slug: 'security' },
    update: {},
    create: {
      name: 'Security',
      slug: 'security',
      description: 'Web Cryptography standards, authentication schemas, and client-side data handling.',
    },
  });

  // 4. Seed Neutral Development Blog Posts
  await prisma.blogPost.upsert({
    where: { slug: 'client-side-developer-tooling' },
    update: {
      title: 'Architecting Client-Side Developer Tooling',
      excerpt: 'How modern WebAssembly and browser APIs enable responsive, local data transformations.',
    },
    create: {
      slug: 'client-side-developer-tooling',
      title: 'Architecting Client-Side Developer Tooling',
      excerpt: 'How modern WebAssembly and browser APIs enable responsive, local data transformations.',
      content: `When developers inspect JSON payloads, format SQL queries, or compute cryptographic hashes, keeping transformations local offers high responsiveness and minimizes unnecessary network overhead.

Modern web standards—including WebAssembly, Web Crypto, and streaming parsers—allow complex transformations to run directly within browser memory. This development guide outlines the architectural patterns used in ByGoodAI's utility engine.`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      authorName: 'ByGoodAI Engineering',
      authorRole: 'Engineering Team',
      authorAvatar: null,
      categoryId: catEngineering.id,
      categoryName: 'Engineering',
      tags: ['ARCHITECTURE', 'PERFORMANCE', 'BROWSER_APIS'],
      readTimeMinutes: 5,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-08-10T14:30:00Z'),
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'understanding-jwt-inspection' },
    update: {
      title: 'Understanding JSON Web Token Inspection and Cryptographic Signatures',
      excerpt: 'A technical breakdown of JWT structure, claims validation, and signature verification.',
    },
    create: {
      slug: 'understanding-jwt-inspection',
      title: 'Understanding JSON Web Token Inspection and Cryptographic Signatures',
      excerpt: 'A technical breakdown of JWT structure, claims validation, and signature verification.',
      content: `A common developer pitfall is assuming that decoding a JWT validates its authenticity. In this guide, we break down header algorithm validation, standard payload claims (exp, nbf, sub), and why signature verification requires private asymmetric keys on a secured server.

ByGoodAI's JWT Inspector parses and analyzes token parts locally while displaying important security considerations for developers.`,
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
      authorName: 'ByGoodAI Security',
      authorRole: 'Security Team',
      authorAvatar: null,
      categoryId: catSecurity.id,
      categoryName: 'Security',
      tags: ['SECURITY', 'JWT', 'AUTHENTICATION'],
      readTimeMinutes: 6,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-08-04T09:15:00Z'),
    },
  });

  // 5. Seed Welcome Notification for Dev User
  const existingNotifications = await prisma.notification.count({
    where: { userId: devUser.id },
  });

  if (existingNotifications === 0) {
    await prisma.notification.create({
      data: {
        userId: devUser.id,
        title: 'Welcome to ByGoodAI Platform',
        message: 'Your developer environment is initialized with PostgreSQL persistence.',
        type: 'SYSTEM',
        isRead: false,
        actionUrl: '/tools',
      },
    });
  }

  console.log('🎉 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
