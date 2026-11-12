-- AlterTable
ALTER TABLE "Order" ADD COLUMN "platformDiscount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TradeInRequest" ADD COLUMN "redeemedOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TradeInRequest_voucherCode_key" ON "TradeInRequest"("voucherCode");
