# ByGoodAI Platform — Production Deployment & Operations Guide

This guide provides the complete operational runbook for deploying, configuring, and operating the ByGoodAI full-stack application in a production environment (Google Cloud Run, AWS ECS/Fargate, Render, Railway, Kubernetes, or self-hosted Docker).

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [PostgreSQL Database Setup & Connection Pooling](#3-postgresql-database-setup--connection-pooling)
4. [Prisma Migrations (Safe Production Flow)](#4-prisma-migrations-safe-production-flow)
5. [Build Process](#5-build-process)
6. [Production Start Command](#6-production-start-command)
7. [Domain & HTTPS Configuration](#7-domain--https-configuration)
8. [CORS Whitelisting](#8-cors-whitelisting)
9. [Razorpay Live Mode Configuration](#9-razorpay-live-mode-configuration)
10. [Razorpay Webhook Configuration](#10-razorpay-webhook-configuration)
11. [Health & Readiness Probes](#11-health--readiness-probes)
12. [Rollback Procedure](#12-rollback-procedure)
13. [Secret Rotation Runbook](#13-secret-rotation-runbook)
14. [Troubleshooting & Diagnostics](#14-troubleshooting--diagnostics)

---

## 1. Prerequisites

Before deploying to production, ensure the target environment provides:
- **Node.js**: v18.0.0 or higher (Node 20+ recommended)
- **PostgreSQL**: PostgreSQL 14 or higher (e.g. Cloud SQL, Amazon RDS, Supabase, Neon) with SSL support
- **Hosting Environment**: Container or VM runtime binding to port `3000` (e.g. Cloud Run, ECS, Docker)
- **SSL/TLS Termination**: Reverse proxy with HTTPS (Cloudflare, Nginx, ALB, or Cloud Run managed SSL)
- **Gemini API Key**: Valid API key from Google AI Studio / Google Cloud Vertex AI
- **Razorpay Merchant Account**: Live activated account with verified KYC for INR subscriptions

---

## 2. Environment Variables Reference

Configure environment variables in your hosting provider's secrets manager (e.g. Google Secret Manager, AWS Secrets Manager, Doppler, or platform dashboard).

| Variable Name | Type | Required | Description / Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | Yes | Set to `production` |
| `DATABASE_URL` | String | Yes | `postgresql://<user>:<pwd>@<host>:5432/<db>?sslmode=require&connection_limit=20` |
| `AUTH_SECRET` | String | Yes | 32+ character random string for session token cryptography |
| `GEMINI_API_KEY` | String | Yes | Google Gemini API key for server-side prompt engineering |
| `APP_URL` / `BACKEND_URL` | String | Yes | `https://your-domain.com` (Public HTTPS URL of your deployment) |
| `FRONTEND_URL` | String | Yes | `https://your-domain.com` (Allowed CORS origin for browser access) |
| `CORS_ORIGIN` | String | Optional | Comma-separated list of allowed origins (e.g. `https://your-domain.com`) |
| `RAZORPAY_KEY_ID` | String | Yes | Live Razorpay Key ID (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | String | Yes | Live Razorpay Key Secret (Server-only secret) |
| `RAZORPAY_WEBHOOK_SECRET` | String | Yes | Webhook signing secret configured in Razorpay Dashboard |
| `RAZORPAY_PRO_PLAN_ID` | String | Yes | Monthly Pro Plan ID in INR (`plan_...` for ₹199/month) |
| `RAZORPAY_ENTERPRISE_PLAN_ID` | String | Yes | Monthly Enterprise Plan ID in INR (`plan_...` for ₹999/month) |
| `RAZORPAY_INTERNATIONAL_ENABLED` | String | Optional | Defaults to `"false"`. Set `"true"` only if global billing is enabled |
| `RAZORPAY_GLOBAL_CURRENCY` | String | Optional | e.g. `"USD"`, `"EUR"` |
| `RAZORPAY_GLOBAL_PRO_PLAN_ID` | String | Optional | Global Pro Plan ID |
| `RAZORPAY_GLOBAL_ENTERPRISE_PLAN_ID`| String | Optional | Global Enterprise Plan ID |

---

## 3. PostgreSQL Database Setup & Connection Pooling

1. **Connection String Format**:
   ```
   postgresql://DB_USER:DB_PASSWORD@DB_HOST:5432/DB_NAME?sslmode=require&connection_limit=20
   ```
2. **Connection Pooling**:
   - For serverless containers (e.g. Google Cloud Run or AWS Lambda), ensure connection pooling using **PgBouncer** or managed pooling (e.g. Supabase Transaction Pooler, AWS RDS Proxy).
   - The Prisma client is instantiated as a singleton in `server/lib/prisma.ts` to prevent connection leaks.
3. **Graceful Shutdown**:
   - The server handles `SIGTERM` and `SIGINT` to call `prisma.$disconnect()` cleanly before exiting.

---

## 4. Prisma Migrations (Safe Production Flow)

### ⚠️ Critical Rule: NEVER run `prisma migrate reset` in production!

Apply pending schema migrations to the production database:

```bash
# 1. Generate fresh Prisma Client artifacts
npx prisma generate

# 2. Deploy migrations safely without dropping data
npx prisma migrate deploy
```

---

## 5. Build Process

The project uses a unified production build script:
- Compiles the React + Vite frontend into static assets in `dist/`
- Bundles `server.ts` into a self-contained Node CommonJS executable at `dist/server.cjs` via `esbuild`

```bash
npm run build
```

---

## 6. Production Start Command

Start the bundled production server:

```bash
npm start
# Under the hood executes: node dist/server.cjs
```

The server binds to `0.0.0.0:3000` and serves both the API endpoints under `/api/*` and the static SPA frontend with SPA client routing fallback for all non-API paths.

---

## 7. Domain & HTTPS Configuration

1. **Reverse Proxy / Load Balancer**:
   - Configure DNS (A/AAAA/CNAME records) pointing to your load balancer or Cloud Run service.
   - Enforce HTTPS termination at the edge (port 443 -> container port 3000).
2. **Reverse Proxy Trust**:
   - `server.ts` enables `app.set('trust proxy', 1)` to correctly inspect client IP addresses, headers, and protocol (`x-forwarded-proto`).

---

## 8. CORS Whitelisting

Production requests require strict origin validation:
- When `FRONTEND_URL` or `CORS_ORIGIN` is specified, only matching origins are allowed access to credentials-carrying requests.
- Wildcard `*` origins are disabled for authenticated APIs.

---

## 9. Razorpay Live Mode Configuration

To transition from Test Mode to Live Mode:
1. Complete KYC and Bank Account verification in the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch toggle to **Live Mode**.
3. Generate **Live API Keys** (`Key ID` and `Key Secret`).
4. Create Monthly Subscription Plans in INR:
   - **Pro Plan**: ₹199 per month (Billing Cycle: Monthly)
   - **Enterprise Plan**: ₹999 per month (Billing Cycle: Monthly)
5. Copy the generated `plan_...` IDs into `RAZORPAY_PRO_PLAN_ID` and `RAZORPAY_ENTERPRISE_PLAN_ID`.

---

## 10. Razorpay Webhook Configuration

After your public HTTPS domain is active:
1. Navigate to **Razorpay Dashboard > Settings > Webhooks > Add New Webhook**.
2. **Webhook URL**:
   ```
   https://YOUR-PRODUCTION-DOMAIN/api/billing/razorpay/webhook
   ```
3. **Secret**: Enter a high-entropy secret string and copy it to `RAZORPAY_WEBHOOK_SECRET`.
4. **Active Events to Subscribe**:
   - `subscription.charged` (Triggered on recurring payment success)
   - `subscription.authenticated`
   - `subscription.activated`
   - `subscription.halted` (Triggered on payment failure)
   - `subscription.cancelled` (Triggered when user or admin cancels subscription)
   - `subscription.completed`
5. **Idempotency & Security**:
   - All events are validated with HMAC SHA-256 signatures over the raw request payload.
   - Processed event IDs are tracked in the PostgreSQL `webhook_events` table to guarantee idempotency.

---

## 11. Health & Readiness Probes

The application provides two dedicated diagnostic endpoints for container orchestrators:

### 1. Health Probe (`GET /api/health`)
- Used for basic liveness checks.
- Returns `200 OK` with system uptime and process memory metrics.

### 2. Readiness Probe (`GET /api/ready`)
- Used by container orchestrators (e.g. Cloud Run, Kubernetes readiness gates) to determine if the container can receive traffic.
- Validates active PostgreSQL connectivity and critical environment variables.
- Returns `200 OK` when ready, or `503 Service Unavailable` if database connectivity is unavailable.

---

## 12. Rollback Procedure

If a deployment incident occurs:
1. **Application Rollback**:
   - Re-deploy the previous container image tag or commit hash.
2. **Database Rollback**:
   - Never drop tables or columns with live production data.
   - If a migration added a nullable column or index, rollback is safe without schema modifications.
   - For breaking schema changes, write forward-fix migrations or execute tested down-migration scripts.

---

## 13. Secret Rotation Runbook

1. **AUTH_SECRET**:
   - Updating `AUTH_SECRET` immediately invalidates active sessions, requiring users to log in again.
2. **GEMINI_API_KEY**:
   - Generate a new key in Google Cloud / AI Studio, update `GEMINI_API_KEY` in secrets manager, and trigger a rolling deployment.
3. **Razorpay Key Secret & Webhook Secret**:
   - Generate secondary key in Razorpay Dashboard.
   - Update `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in production secrets.
   - Revoke previous key once confirmed operational.

---

## 14. Troubleshooting & Diagnostics

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| `DATABASE_UNAVAILABLE` (503) | PostgreSQL unreachable or invalid `DATABASE_URL` | Check database host, credentials, SSL mode (`sslmode=require`), and VPC network peering. |
| `AI_PROVIDER_NOT_CONFIGURED` (503) | Missing or empty `GEMINI_API_KEY` | Ensure `GEMINI_API_KEY` is provided in environment variables. |
| `INVALID_API_KEY` (401) | Malformed or revoked Bearer token on `/api/v1/*` | Verify client uses `Authorization: Bearer osk_live_...` format and key is not revoked. |
| `CORS Error in Browser` | Origin mismatch in `FRONTEND_URL` | Verify exact domain (including `https://` and port if non-standard) matches `FRONTEND_URL`. |
| Webhook signature failure (400) | `RAZORPAY_WEBHOOK_SECRET` mismatch | Ensure webhook secret in Razorpay dashboard matches environment variable exactly. |
