-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROGRAMME', 'EVENEMENT', 'INFO', 'PRIERE', 'RAPPEL', 'GENERIC');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERIC',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkTo" TEXT,
    "sourceId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "pushed" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_deletedAt_idx" ON "notifications"("deletedAt");
