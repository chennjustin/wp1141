-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('EXPENSE', 'INCOME');

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "type" "TagType" NOT NULL DEFAULT 'EXPENSE';
