-- CreateTable
CREATE TABLE "TradeInRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "conditionNote" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "grade" TEXT NOT NULL,
    "estimatedValue" INTEGER NOT NULL,
    "finalValue" INTEGER,
    "voucherCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AI_PRELIMINARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeInRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "zipSealCode" TEXT NOT NULL,
    "insuredValue" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradeInRequest_userId_createdAt_idx" ON "TradeInRequest"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CareBooking_zipSealCode_key" ON "CareBooking"("zipSealCode");

-- CreateIndex
CREATE INDEX "CareBooking_userId_createdAt_idx" ON "CareBooking"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "TradeInRequest" ADD CONSTRAINT "TradeInRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareBooking" ADD CONSTRAINT "CareBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
