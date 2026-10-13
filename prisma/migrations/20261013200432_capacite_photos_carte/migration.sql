-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "maxGuestsAtOnce" INTEGER NOT NULL DEFAULT 45,
ADD COLUMN     "maxGuestsPerSlot" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "notifyEmail" TEXT,
ALTER COLUMN "maxOnlinePartySize" SET DEFAULT 8;
