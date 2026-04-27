CREATE EXTENSION IF NOT EXISTS "btree_gist";

CREATE TYPE "ReservationStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'NO_SHOW'
);

CREATE TABLE "RoomType" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" JSONB NOT NULL,
  "description" JSONB NOT NULL,
  "capacity" INTEGER NOT NULL,
  "basePriceBRL" DECIMAL(10, 2) NOT NULL,
  "photos" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Room" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "roomTypeId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reservation" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "roomTypeId" TEXT NOT NULL,
  "guestName" TEXT NOT NULL,
  "guestEmail" TEXT NOT NULL,
  "guestPhone" TEXT,
  "guestCount" INTEGER NOT NULL,
  "checkIn" DATE NOT NULL,
  "checkOut" DATE NOT NULL,
  "priceTotalBRL" DECIMAL(10, 2) NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExchangeRate" (
  "id" TEXT NOT NULL,
  "base" TEXT NOT NULL,
  "quote" TEXT NOT NULL,
  "rate" DECIMAL(18, 8) NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoomType_slug_key" ON "RoomType"("slug");
CREATE UNIQUE INDEX "Room_number_key" ON "Room"("number");
CREATE UNIQUE INDEX "Reservation_code_key" ON "Reservation"("code");
CREATE INDEX "Reservation_guestEmail_idx" ON "Reservation"("guestEmail");
CREATE INDEX "Reservation_code_idx" ON "Reservation"("code");
CREATE UNIQUE INDEX "ExchangeRate_base_quote_fetchedAt_key" ON "ExchangeRate"("base", "quote", "fetchedAt");
CREATE INDEX "ExchangeRate_base_quote_idx" ON "ExchangeRate"("base", "quote");

ALTER TABLE "Room"
  ADD CONSTRAINT "Room_roomTypeId_fkey"
  FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "Room"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Reservation"
  ADD CONSTRAINT "no_overlap_active"
  EXCLUDE USING gist (
    "roomId" WITH =,
    daterange("checkIn", "checkOut", '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN'));
