-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "ingredients" JSONB,
ADD COLUMN     "subtitle" JSONB,
ALTER COLUMN "priceCents" DROP NOT NULL;
