# ByGoodAI Platform - Security Architecture & Hardening Guide

## 1. Executive Summary & Threat Model
ByGoodAI Platform enforces a **defense-in-depth, zero-trust security paradigm**. The platform enforces strict boundary separation between client-side developer workstation utilities, server-side business logic, database transactions, payment processing, and external AI services.

---

## 2. Authentication & Session Security

### 2.1 Password Security & Storage
* **Work Factor**: Plaintext passwords are never stored. Passwords are salted and hashed using `bcryptjs` with a work factor of `12` (`genSalt(12)`).
* **Hash Protection**: Password hashes are strictly excluded from API response projections via the server-side `toSafeUser()` mapper.
* **Authentication Timing**: Password verification uses constant-time comparison in `bcrypt.compare` to mitigate timing-based enumeration attacks.
* **Brute-Force Defense**: Dedicated `authLimiter` restricts authentication attempts to 20 requests per 15 minutes per IP address.

### 2.2 Session Management
* **Entropy**: Session tokens are 256-bit cryptographically secure random values generated via `crypto.randomBytes(32).toString('hex')`.
* **Cookie Configuration**:
  * `HttpOnly: true` — Prevents JavaScript access and protects against XSS token exfiltration.
  * `Secure: true` (Production) — Enforces HTTPS-only transmission.
  * `SameSite: strict` (Production) / `lax` (Development) — Restricts cross-site cookie transmission.
  * `Path: /` — Explicitly defines cookie boundary.
  * `Expires`: 7 days with automatic server-side expiry validation.
* **Session Invalidation**:
  * Logging out deletes the session from PostgreSQL and immediately clears the client cookie via `clearSessionCookie()`.
  * Password updates revoke all other active sessions via `destroyAllUserSessions(userId, currentToken)`.

---

## 3. Cross-Site Request Forgery (CSRF) & CORS

### 3.1 CSRF Defense (`csrfProtection.ts`)
* **State-Changing Methods**: Enforced on all `POST`, `PUT`, `PATCH`, and `DELETE` requests.
* **Strict Origin/Referer Enforcement**: For cookie-authenticated requests, if BOTH `Origin` and `Referer` headers are missing, the request is strictly rejected with **HTTP 403 `CSRF_BLOCKED`**. `Content-Type: application/json` is NOT permitted to bypass validation.
* **Exemptions**:
  * Safe methods (`GET`, `HEAD`, `OPTIONS`).
  * Bearer-token authenticated developer API requests (`Authorization: Bearer ...` or `x-api-key`).
  * **Exact Route Exemption Only**: The exact Razorpay webhook route `/api/billing/razorpay/webhook` is exempt from browser CSRF checking because it independently validates HMAC SHA-256 signatures on the raw request body. Generic `/webhook` paths are not exempt.

### 3.2 Cross-Origin Resource Sharing (CORS)
* Configured in `server.ts` with strict origin whitelisting:
  * In production, requests from unlisted origins are rejected (`callback(new Error('CORS origin not allowed'))`).
  * Wildcard `*` origins are strictly forbidden when `credentials: true`.
  * Allowed HTTP methods and headers are explicitly constrained.

---

## 4. Authorization & IDOR Protection

### 4.1 Role-Based Access Control (RBAC)
* **Roles**: `USER` and `ADMIN`.
* **Enforcement**: Routes are protected by `requireAuth` and `requireAdmin` middlewares.
* **Server-Authoritative Validation**: User roles and subscription plans are queried directly from PostgreSQL on every authenticated request.

### 4.2 Insecure Direct Object Reference (IDOR) Elimination
All user-specific operations enforce database ownership queries:
* **API Keys**: Revocation verifies `where: { id: keyId, userId: req.user.id }`.
* **Execution History**: Record deletion verifies `where: { id: historyId, userId: req.user.id }`.
* **Saved Tools**: Bookmark removal scopes by `where: { userId_toolSlug: { userId: req.user.id, toolSlug } }`.
* **Notifications**: Mark-as-read queries verify `where: { id: notificationId, userId: req.user.id }`.
* **Subscriptions**: Verification and cancellation enforce `where: { razorpaySubscriptionId, userId: req.user.id }`.

---

## 5. Developer API Key Security (`/api/v1`)

* **Generation**: 192 bits of entropy via `crypto.randomBytes(24)` prefixed with `osk_live_`.
* **One-Time Display**: Raw keys are returned to the user exactly once at creation time and are never stored in plaintext.
* **Storage**: Keys are stored as one-way SHA-256 hashes (`keyHash`). Lookups hash incoming keys and match against indexed hash records.
* **Key Revocation & Expiration**: Keys support lifecycle status (`ACTIVE`, `EXPIRED`, `REVOKED`), optional expiration dates, and immediate server-side revocation.
* **Rate Limiting**: Developer API endpoints are protected by `developerApiLimiter` (60 req/min per key/user).

---

## 6. AI Endpoint & Secret Key Isolation

* **Zero Client Exposure**: `GEMINI_API_KEY` is exclusively read and utilized within server-side modules (`server/services/aiService.ts`). No `VITE_` prefix is ever applied to API keys.
* **Prompt Injection & Token Bounds**: Input prompts are validated and bounded using `zod` schemas (maximum 10,000 characters).
* **Quota & Abuse Protection**: AI requests require an authenticated user session, enforce plan-specific quotas (e.g. 50/mo Free, 1,000/mo Pro, 10,000/mo Enterprise), and are rate-limited via `aiLimiter` (20 req/min).

---

## 7. Payment Security & Webhook Cryptography

* **Provider**: Razorpay is the sole server-authoritative payment provider.
* **Checkout Signatures**: Client checkouts return `razorpay_payment_id`, `razorpay_subscription_id`, and `razorpay_signature`. The server recomputes HMAC SHA-256 (`crypto.createHmac('sha256', secret).update(data).digest('hex')`) and compares in constant time.
* **Webhook Signatures**: Webhooks require `x-razorpay-signature` and are verified against the raw request buffer (`req.rawBody`).
* **Idempotency & Replay Protection**: Webhook events insert their `(provider, eventId)` into the `webhook_events` PostgreSQL table with a database unique constraint. Duplicate deliveries are safely acknowledged and skipped.
* **Plan Spoofing Prevention**: Webhook plan IDs are strictly validated against environment plan IDs before modifying user entitlements.

---

## 8. Security Headers, CSP & Frame Protection

Configured via `helmet` in `server.ts`:
* **Content-Security-Policy**:
  * `default-src: 'self'`
  * `script-src: 'self' 'unsafe-inline' https://checkout.razorpay.com` (`'unsafe-eval'` removed)
  * `frame-src: 'self' https://api.razorpay.com https://checkout.razorpay.com`
  * `frame-ancestors: 'self' https://*.google.com https://*.run.app https://ai.studio`
  * `img-src: 'self' data: blob: https: http:`
  * `connect-src: 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://generativelanguage.googleapis.com`
* **Frame Protection**: `frameguard: false` in Helmet is combined with granular CSP `frame-ancestors` to allow safe previewing inside Google AI Studio and Cloud Run while blocking unauthorized third-party clickjacking.
* **Referrer-Policy**: `strict-origin-when-cross-origin`
* **X-Content-Type-Options**: `nosniff`

---

## 9. Error Logging & Request ID Tracing

* **Sanitized Structured Logging**: `errorHandler.ts` formats structured JSON log entries without logging credentials, raw error objects, tokens, passwords, API keys, secrets, or full request bodies.
* **Cryptographic Request ID**: `requestIdMiddleware` generates or propagates a unique UUID `req.id` and sets the `X-Request-Id` header for request tracing and error correlation.

---

## 10. Database Safety & Input Validation

* **SQL Injection**: All database operations use Prisma ORM parameterized queries. Raw string concatenation in SQL queries is completely prohibited.
* **Input Validation**: All incoming requests are validated against strict `zod` schemas before executing business logic.
* **Relational Integrity**: Foreign keys enforce referential integrity with `Cascade` or `SetNull` delete behaviors.
