-- AlterTable
ALTER TABLE "public"."posts" ADD COLUMN     "storyGenerationId" TEXT,
ADD COLUMN     "storyPeriod" TEXT;

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "public"."posts"("status");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "public"."posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "public"."posts"("createdAt");

-- CreateIndex
CREATE INDEX "posts_status_createdAt_idx" ON "public"."posts"("status", "createdAt");

-- CreateIndex
CREATE INDEX "posts_authorId_storyGenerationId_idx" ON "public"."posts"("authorId", "storyGenerationId");

-- CreateIndex
CREATE INDEX "replies_postId_idx" ON "public"."replies"("postId");

-- CreateIndex
CREATE INDEX "replies_authorId_idx" ON "public"."replies"("authorId");
