-- CreateEnum
CREATE TYPE "Category" AS ENUM ('WIDOW', 'ELDERLY', 'DISABLED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "nid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientPhoto" (
    "recipientId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mime" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipientPhoto_pkey" PRIMARY KEY ("recipientId")
);

-- CreateTable
CREATE TABLE "ReliefCard" (
    "cardNo" SERIAL NOT NULL,
    "recipientId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReliefCard_pkey" PRIMARY KEY ("cardNo")
);

-- CreateTable
CREATE TABLE "ReliefRequest" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReliefRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distribution" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "period" TEXT NOT NULL,
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_nid_key" ON "Recipient"("nid");

-- CreateIndex
CREATE INDEX "Recipient_status_idx" ON "Recipient"("status");

-- CreateIndex
CREATE INDEX "Recipient_category_idx" ON "Recipient"("category");

-- CreateIndex
CREATE INDEX "Recipient_name_idx" ON "Recipient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReliefCard_recipientId_key" ON "ReliefCard"("recipientId");

-- CreateIndex
CREATE INDEX "ReliefRequest_period_idx" ON "ReliefRequest"("period");

-- CreateIndex
CREATE UNIQUE INDEX "ReliefRequest_recipientId_period_key" ON "ReliefRequest"("recipientId", "period");

-- CreateIndex
CREATE INDEX "Distribution_period_idx" ON "Distribution"("period");

-- CreateIndex
CREATE UNIQUE INDEX "Distribution_recipientId_itemKey_period_key" ON "Distribution"("recipientId", "itemKey", "period");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "RecipientPhoto" ADD CONSTRAINT "RecipientPhoto_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefCard" ADD CONSTRAINT "ReliefCard_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefRequest" ADD CONSTRAINT "ReliefRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
