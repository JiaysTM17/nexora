-- AlterTable
ALTER TABLE "Order" ADD COLUMN "affiliateUserId" TEXT;

-- CreateTable
CREATE TABLE "AffiliateEarning" (
    "id" TEXT NOT NULL,
    "kocUserId" TEXT NOT NULL,
    "shopOrderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HELD',
    "holdUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateEarning_shopOrderId_key" ON "AffiliateEarning"("shopOrderId");

-- CreateIndex
CREATE INDEX "AffiliateEarning_kocUserId_status_idx" ON "AffiliateEarning"("kocUserId", "status");

-- AddForeignKey
ALTER TABLE "AffiliateEarning" ADD CONSTRAINT "AffiliateEarning_kocUserId_fkey" FOREIGN KEY ("kocUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
