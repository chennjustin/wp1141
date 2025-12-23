-- CreateTable
CREATE TABLE "SubscriptionPayer" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SubscriptionPayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionShare" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SubscriptionShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionPayer_subscriptionId_idx" ON "SubscriptionPayer"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionPayer_payerId_idx" ON "SubscriptionPayer"("payerId");

-- CreateIndex
CREATE INDEX "SubscriptionShare_subscriptionId_idx" ON "SubscriptionShare"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionShare_userId_idx" ON "SubscriptionShare"("userId");

-- AddForeignKey
ALTER TABLE "SubscriptionPayer" ADD CONSTRAINT "SubscriptionPayer_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayer" ADD CONSTRAINT "SubscriptionPayer_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionShare" ADD CONSTRAINT "SubscriptionShare_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionShare" ADD CONSTRAINT "SubscriptionShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
