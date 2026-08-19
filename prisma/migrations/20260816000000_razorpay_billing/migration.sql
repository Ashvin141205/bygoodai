-- Drop old Stripe columns and tables if needed, create Razorpay Subscription and WebhookEvent schema

DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
CREATE TYPE "SubscriptionStatus" AS ENUM ('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PENDING', 'HALTED', 'CANCELLED', 'COMPLETED', 'EXPIRED', 'PAUSED');

-- AlterTable users
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "razorpayCustomerId" TEXT;

-- CreateTable subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayCustomerId" TEXT,
    "razorpaySubscriptionId" TEXT NOT NULL,
    "razorpayPlanId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'CREATED',
    "plan" "UserPlan" NOT NULL DEFAULT 'PRO',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "chargeAt" TIMESTAMP(3),
    "totalCount" INTEGER,
    "paidCount" INTEGER NOT NULL DEFAULT 0,
    "remainingCount" INTEGER,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- Recreate webhook_events table
DROP TABLE IF EXISTS "webhook_events" CASCADE;
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_razorpayCustomerId_key" ON "users"("razorpayCustomerId");
CREATE INDEX IF NOT EXISTS "users_razorpayCustomerId_idx" ON "users"("razorpayCustomerId");

CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");
CREATE UNIQUE INDEX "subscriptions_razorpaySubscriptionId_key" ON "subscriptions"("razorpaySubscriptionId");
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");
CREATE INDEX "subscriptions_razorpayCustomerId_idx" ON "subscriptions"("razorpayCustomerId");
CREATE INDEX "subscriptions_razorpaySubscriptionId_idx" ON "subscriptions"("razorpaySubscriptionId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

CREATE UNIQUE INDEX "webhook_events_provider_eventId_key" ON "webhook_events"("provider", "eventId");
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events"("provider");
CREATE INDEX "webhook_events_eventId_idx" ON "webhook_events"("eventId");
CREATE INDEX "webhook_events_eventType_idx" ON "webhook_events"("eventType");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
