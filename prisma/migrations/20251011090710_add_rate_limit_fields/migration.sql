/*
  Warnings:

  - You are about to drop the column `category` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `targetDate` on the `goals` table. All the data in the column will be lost.
  - Added the required column `deadline` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."GoalPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."goals" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "targetDate",
ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "period" "public"."GoalPeriod" NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."GoalStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "dailyGenerationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastGenerationDate" TIMESTAMP(3);

-- DropEnum
DROP TYPE "public"."GoalCategory";

-- CreateIndex
CREATE INDEX "goals_userId_status_idx" ON "public"."goals"("userId", "status");

-- CreateIndex
CREATE INDEX "goals_userId_period_idx" ON "public"."goals"("userId", "period");
