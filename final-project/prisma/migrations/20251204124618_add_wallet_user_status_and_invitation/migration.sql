-- CreateEnum
CREATE TYPE "WalletUserStatus" AS ENUM ('OWNER', 'PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'WALLET_INVITATION';

-- AlterTable
ALTER TABLE "WalletUser" ADD COLUMN     "status" "WalletUserStatus" NOT NULL DEFAULT 'OWNER';
