/*
  Warnings:

  - You are about to drop the column `label` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "label",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tagId" TEXT NOT NULL,
ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE';

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
