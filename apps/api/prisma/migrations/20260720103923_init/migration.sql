-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "PromptRole" AS ENUM ('CONTENT_AGENT', 'TREND_AGENT', 'ANALYTICS_AGENT', 'COMMUNITY_AGENT', 'IMAGE_AGENT');

-- CreateEnum
CREATE TYPE "TweetStatus" AS ENUM ('DRAFT', 'SUGGESTED', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('CONTENT', 'TREND', 'ANALYTICS', 'COMMUNITY', 'IMAGE');

-- CreateEnum
CREATE TYPE "ImageStyle" AS ENUM ('COMIC', 'THREE_D', 'PIXAR', 'ANIME', 'CYBERPUNK', 'PAINTING', 'REALISTIC', 'MEME', 'PIXEL_ART', 'VINTAGE', 'NOIR', 'SYNTHWAVE');

-- CreateEnum
CREATE TYPE "TrendSource" AS ENUM ('CRYPTO', 'MEMECOIN', 'SOLANA', 'BITCOIN', 'ETHEREUM', 'PUMPFUN', 'BANTER', 'MEME_CULTURE');

-- CreateEnum
CREATE TYPE "ReplyStatus" AS ENUM ('SUGGESTED', 'APPROVED', 'SENT', 'FLAGGED', 'DISMISSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_credentials" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pablo_memory_versions" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "changelog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pablo_memory_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "role" "PromptRole" NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "changelog" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweets" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "TweetStatus" NOT NULL DEFAULT 'DRAFT',
    "themes" TEXT[],
    "hashtags" TEXT[],
    "agentReasoning" TEXT NOT NULL,
    "xTweetId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdByAgent" "AgentType" NOT NULL DEFAULT 'CONTENT',
    "sourceTrendId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tweets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_entries" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "TweetStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_images" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "style" "ImageStyle" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "linkedTweetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "used_memory_items" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "used_memory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trend_insights" (
    "id" TEXT NOT NULL,
    "source" "TrendSource" NOT NULL,
    "topic" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestedAngle" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trend_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "reposts" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followersDelta" INTEGER NOT NULL DEFAULT 0,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_insights" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_replies" (
    "id" TEXT NOT NULL,
    "originalMessageId" TEXT NOT NULL,
    "originalAuthor" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "suggestedReply" TEXT NOT NULL,
    "status" "ReplyStatus" NOT NULL DEFAULT 'SUGGESTED',
    "sensitiveFlag" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "approvedById" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_decision_logs" (
    "id" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "action" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "metricsUsed" TEXT[],
    "relatedTweetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_decision_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_credentials_provider_label_key" ON "api_credentials"("provider", "label");

-- CreateIndex
CREATE UNIQUE INDEX "pablo_memory_versions_version_key" ON "pablo_memory_versions"("version");

-- CreateIndex
CREATE INDEX "prompt_templates_role_isActive_idx" ON "prompt_templates"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_role_version_key" ON "prompt_templates"("role", "version");

-- CreateIndex
CREATE UNIQUE INDEX "tweets_xTweetId_key" ON "tweets"("xTweetId");

-- CreateIndex
CREATE INDEX "tweets_status_idx" ON "tweets"("status");

-- CreateIndex
CREATE INDEX "tweets_scheduledAt_idx" ON "tweets"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_entries_tweetId_key" ON "calendar_entries"("tweetId");

-- CreateIndex
CREATE INDEX "calendar_entries_scheduledAt_idx" ON "calendar_entries"("scheduledAt");

-- CreateIndex
CREATE INDEX "generated_images_style_idx" ON "generated_images"("style");

-- CreateIndex
CREATE INDEX "generated_images_scenario_idx" ON "generated_images"("scenario");

-- CreateIndex
CREATE INDEX "used_memory_items_kind_idx" ON "used_memory_items"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "used_memory_items_kind_value_key" ON "used_memory_items"("kind", "value");

-- CreateIndex
CREATE INDEX "trend_insights_source_idx" ON "trend_insights"("source");

-- CreateIndex
CREATE INDEX "trend_insights_detectedAt_idx" ON "trend_insights"("detectedAt");

-- CreateIndex
CREATE INDEX "analytics_snapshots_tweetId_idx" ON "analytics_snapshots"("tweetId");

-- CreateIndex
CREATE INDEX "analytics_snapshots_capturedAt_idx" ON "analytics_snapshots"("capturedAt");

-- CreateIndex
CREATE INDEX "analytics_insights_kind_idx" ON "analytics_insights"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "community_replies_originalMessageId_key" ON "community_replies"("originalMessageId");

-- CreateIndex
CREATE INDEX "community_replies_status_idx" ON "community_replies"("status");

-- CreateIndex
CREATE INDEX "agent_decision_logs_agentType_idx" ON "agent_decision_logs"("agentType");

-- CreateIndex
CREATE INDEX "agent_decision_logs_createdAt_idx" ON "agent_decision_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_sourceTrendId_fkey" FOREIGN KEY ("sourceTrendId") REFERENCES "trend_insights"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_linkedTweetId_fkey" FOREIGN KEY ("linkedTweetId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_replies" ADD CONSTRAINT "community_replies_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_decision_logs" ADD CONSTRAINT "agent_decision_logs_relatedTweetId_fkey" FOREIGN KEY ("relatedTweetId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
