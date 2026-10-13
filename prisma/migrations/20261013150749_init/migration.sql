-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ReservationSource" AS ENUM ('WEBSITE', 'PHONE', 'WALK_IN', 'ADMIN');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('NONE', 'BIRTHDAY', 'FRIENDS', 'DATE', 'PRIVATE_EVENT', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('ROUND', 'SQUARE', 'RECT', 'BOOTH');

-- CreateEnum
CREATE TYPE "MenuSection" AS ENUM ('SHISHA', 'DRINK', 'FOOD');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('DJ', 'SPORT', 'THEME', 'LIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('BIRTHDAY', 'BACHELOR', 'CORPORATE', 'PRIVATE', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'DECLINED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "venueName" TEXT NOT NULL DEFAULT 'GOIA Lounge',
    "street" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "googleReviewsUrl" TEXT,
    "slotIntervalMin" INTEGER NOT NULL DEFAULT 30,
    "defaultDurationMin" INTEGER NOT NULL DEFAULT 150,
    "lastSeatingBeforeCloseMin" INTEGER NOT NULL DEFAULT 60,
    "minLeadMin" INTEGER NOT NULL DEFAULT 60,
    "maxDaysAhead" INTEGER NOT NULL DEFAULT 60,
    "maxOnlinePartySize" INTEGER NOT NULL DEFAULT 10,
    "cancelHoursBefore" INTEGER NOT NULL DEFAULT 3,
    "depositEnabled" BOOLEAN NOT NULL DEFAULT false,
    "depositMinPartySize" INTEGER NOT NULL DEFAULT 8,
    "depositPerPersonCents" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningHours" (
    "weekday" INTEGER NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OpeningHours_pkey" PRIMARY KEY ("weekday")
);

-- CreateTable
CREATE TABLE "SpecialDay" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "title" JSONB,
    "note" TEXT,

    CONSTRAINT "SpecialDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "outdoor" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "planWidth" INTEGER NOT NULL DEFAULT 1000,
    "planHeight" INTEGER NOT NULL DEFAULT 700,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minCovers" INTEGER NOT NULL DEFAULT 1,
    "maxCovers" INTEGER NOT NULL,
    "shape" "TableShape" NOT NULL DEFAULT 'ROUND',
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "rotation" INTEGER NOT NULL DEFAULT 0,
    "onlineBookable" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableBlock" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "TableBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "vip" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "source" "ReservationSource" NOT NULL DEFAULT 'WEBSITE',
    "customerId" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "partySize" INTEGER NOT NULL,
    "preferredZoneId" TEXT,
    "occasion" "Occasion" NOT NULL DEFAULT 'NONE',
    "specialRequest" TEXT,
    "preorder" JSONB,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "manageTokenHash" TEXT,
    "adultConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "privacyAcceptedAt" TIMESTAMPTZ(3),
    "depositStatus" "DepositStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "depositCents" INTEGER,
    "stripeSessionId" TEXT,
    "internalNote" TEXT,
    "cancelledBy" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationTable" (
    "reservationId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReservationTable_pkey" PRIMARY KEY ("reservationId","tableId")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "section" "MenuSection" NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "priceCents" INTEGER NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "available" BOOLEAN NOT NULL DEFAULT true,
    "preorderable" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuExtra" (
    "id" TEXT NOT NULL,
    "section" "MenuSection" NOT NULL,
    "name" JSONB NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MenuExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'OTHER',
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" JSONB NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" INTEGER,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "date" DATE NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivatizationRequest" (
    "id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL DEFAULT 'OTHER',
    "date" DATE NOT NULL,
    "guests" INTEGER NOT NULL,
    "budgetCents" INTEGER,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "internalNote" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivatizationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateEvent" (
    "id" BIGSERIAL NOT NULL,
    "bucket" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialDay_date_key" ON "SpecialDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_slug_key" ON "Zone"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Table_zoneId_label_key" ON "Table"("zoneId", "label");

-- CreateIndex
CREATE INDEX "TableBlock_tableId_startsAt_idx" ON "TableBlock"("tableId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reference_key" ON "Reservation"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_stripeSessionId_key" ON "Reservation"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Reservation_startAt_idx" ON "Reservation"("startAt");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");

-- CreateIndex
CREATE INDEX "ReservationTable_tableId_startAt_idx" ON "ReservationTable"("tableId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_slug_key" ON "MenuCategory"("slug");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_order_idx" ON "MenuItem"("categoryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "RateEvent_bucket_keyHash_createdAt_idx" ON "RateEvent"("bucket", "keyHash", "createdAt");

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableBlock" ADD CONSTRAINT "TableBlock_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationTable" ADD CONSTRAINT "ReservationTable_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationTable" ADD CONSTRAINT "ReservationTable_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===========================================================================
-- Anti-double réservation (ajout manuel, non généré par Prisma)
-- ---------------------------------------------------------------------------
-- 1. Les lignes ReservationTable recopient toujours les horaires et l'état de
--    leur réservation (déclencheurs ci-dessous) : l'application ne peut pas
--    les désynchroniser.
-- 2. La contrainte d'exclusion interdit, au niveau de la base, deux lignes
--    actives qui se chevauchent sur la même table, même si deux clients
--    valident au même instant.
-- ===========================================================================

CREATE OR REPLACE FUNCTION goia_reservation_is_active(s "ReservationStatus") RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$ SELECT s IN ('PENDING', 'CONFIRMED', 'SEATED') $$;

-- Avant chaque insertion/modification d'une ligne ReservationTable : recopie depuis la réservation
CREATE OR REPLACE FUNCTION goia_reservation_table_sync() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
  SELECT "startAt", "endAt", "status" INTO r FROM "Reservation" WHERE "id" = NEW."reservationId";
  NEW."startAt" := r."startAt";
  NEW."endAt" := r."endAt";
  NEW."active" := goia_reservation_is_active(r."status");
  RETURN NEW;
END $$;

CREATE TRIGGER reservation_table_sync
BEFORE INSERT OR UPDATE ON "ReservationTable"
FOR EACH ROW EXECUTE FUNCTION goia_reservation_table_sync();

-- Après modification d'une réservation (horaires ou statut) : met à jour ses tables
CREATE OR REPLACE FUNCTION goia_reservation_propagate() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."startAt" IS DISTINCT FROM OLD."startAt" OR NEW."endAt" IS DISTINCT FROM OLD."endAt"
     OR NEW."status" IS DISTINCT FROM OLD."status" THEN
    UPDATE "ReservationTable"
       SET "startAt" = NEW."startAt", "endAt" = NEW."endAt", "active" = goia_reservation_is_active(NEW."status")
     WHERE "reservationId" = NEW."id";
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER reservation_propagate
AFTER UPDATE ON "Reservation"
FOR EACH ROW EXECUTE FUNCTION goia_reservation_propagate();

ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_period_check" CHECK ("endAt" > "startAt");

ALTER TABLE "ReservationTable" ADD CONSTRAINT "ReservationTable_no_overlap"
  EXCLUDE USING gist ("tableId" WITH =, tstzrange("startAt", "endAt", '[)') WITH &&)
  WHERE ("active");
