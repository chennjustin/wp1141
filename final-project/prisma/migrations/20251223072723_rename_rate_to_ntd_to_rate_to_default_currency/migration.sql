/*
  Warnings:

  - You are about to drop the column `rateToNTD` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "rateToDefaultCurrency" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "rateToNTD",
ADD COLUMN     "rateToDefaultCurrency" DOUBLE PRECISION;
