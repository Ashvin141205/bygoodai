# ByGoodAI Platform - Performance & Reliability Architecture

## 1. Architectural Overview & Design Goals
ByGoodAI Platform is designed around a **client-first computation model** paired with an asynchronous Node.js/Express backend and an indexed PostgreSQL persistence layer.

### 1.1 Architectural Performance Targets
* **Client-First Execution Goal**: Primary developer tools (formatting, encoding, conversion, regex testing) are engineered to execute in-memory within the client browser without backend round-trips.
* **API Response Target**: Backend API routes (authentication, usage metrics, bookmarks, developer API) target low-latency execution through optimized Prisma indexing and minimal middleware overhead.
* **High-Concurrency Resilience**: Tiered in-memory rate limiting and database connection pooling provide baseline protection against resource exhaustion under concurrent traffic.

---

## 2. Client-First Architecture

### 2.1 Browser-Native Computation Paradigm
* **Local In-Memory Utilities**: Standard developer utilities (JSON Formatter, Base64 Encoder, JWT Inspector, Hash Generator, UUID Generator, Color Palette, RegEx Tester, Markdown Previewer) execute entirely within the client-side JavaScript engine.
* **Architectural Objectives**:
  * Offloads CPU-intensive string manipulation and formatting from backend application instances.
  * Preserves user data privacy by avoiding unnecessary network transmission of sensitive developer payloads.
  * Ensures tool availability and responsiveness even under network latency or degraded backend connectivity.

---

## 3. Database Performance & Indexing Strategy

### 3.1 Index Optimization
All critical search, query, and foreign-key join paths in PostgreSQL are indexed in `prisma/schema.prisma`:
* `users`: B-tree index on `email`, unique index on `razorpayCustomerId`.
* `sessions`: Indices on `userId`, `expiresAt`, and unique index on `sessionToken`.
* `api_keys`: Indices on `userId`, `revokedAt`, and unique index on `keyHash`.
* `subscriptions`: Indices on `userId`, `status`, `provider`, `currency`, and unique index on `razorpaySubscriptionId`.
* `webhook_events`: Composite unique constraint on `(provider, eventId)` for $O(1)$ duplicate event detection.
* `tool_executions`: Indices on `userId`, `toolSlug`, `createdAt`.
* `usage_records`: Indices on `userId`, `type`, `createdAt`, `apiKeyId`.

### 3.2 Prisma Client & Connection Management
* A singleton `PrismaClient` instance is shared across the entire backend process lifecycle.
* Supports PostgreSQL Unix domain sockets when connecting via Google Cloud SQL proxy (`host=/cloudsql/INSTANCE_CONNECTION_NAME`).
* Graceful process lifecycle management (`SIGTERM`/`SIGINT`) drains in-flight requests before disconnecting the connection pool.

---

## 4. API Rate Limiting & Resource Throttling

### 4.1 Tiered Rate Limiters
Fixed-window and token-bucket limiters implemented via `express-rate-limit`:
* `standardLimiter`: 120 requests/minute per IP across `/api` routes.
* `writeLimiter`: 40 write operations/minute per IP on state-changing endpoints.
* `authLimiter`: 20 requests/15 minutes per IP on sensitive authentication routes.
* `developerApiLimiter`: 60 requests/minute per authenticated user ID or API key.
* `aiLimiter`: 20 requests/minute per IP on server-side AI endpoints.

---

## 5. Production Asset Bundling & Caching

### 5.1 Vite & esbuild Pipeline
* Single-command production build (`npm run build`):
  * **Frontend**: Vite compiles React components with tree-shaking, code splitting, and minification into the `dist/` directory.
  * **Backend**: `esbuild` bundles `server.ts` into a CommonJS production bundle (`dist/server.cjs`) with `--packages=external`.
* Express serves static assets from `dist/` with standard caching and fallback routing to `dist/index.html`.

---

## 6. System Diagnostics & Health Probes

### 6.1 Health & Readiness Endpoints
* `GET /api/health`: Operational health check returning HTTP 200 when database connectivity is verified, and HTTP 503 when degraded or disconnected.
* `GET /api/ready`: Strict readiness probe for container orchestrators (Cloud Run, Kubernetes) validating core database and secret configuration before routing traffic.
