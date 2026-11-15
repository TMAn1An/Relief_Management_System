-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecipientPhoto" (
    "recipientId" TEXT NOT NULL PRIMARY KEY,
    "data" BLOB NOT NULL,
    "mime" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecipientPhoto_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReliefCard" (
    "cardNo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipientId" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReliefCard_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReliefRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReliefRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Distribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "period" TEXT NOT NULL,
    "distributedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Distribution_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
