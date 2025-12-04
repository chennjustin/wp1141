-- CreateTable
CREATE TABLE "UserPinnedWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPinnedWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPinnedWallet_userId_idx" ON "UserPinnedWallet"("userId");

-- CreateIndex
CREATE INDEX "UserPinnedWallet_userId_order_idx" ON "UserPinnedWallet"("userId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "UserPinnedWallet_userId_walletId_key" ON "UserPinnedWallet"("userId", "walletId");

-- AddForeignKey
ALTER TABLE "UserPinnedWallet" ADD CONSTRAINT "UserPinnedWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPinnedWallet" ADD CONSTRAINT "UserPinnedWallet_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
