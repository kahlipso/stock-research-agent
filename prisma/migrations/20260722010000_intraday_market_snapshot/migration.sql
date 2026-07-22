CREATE TYPE "MarketStatus" AS ENUM ('PRE_MARKET', 'OPEN', 'AFTER_HOURS', 'CLOSED', 'UNKNOWN');

ALTER TABLE "MarketSnapshot"
  ADD COLUMN "previousClose" DECIMAL(18,4),
  ADD COLUMN "currentPrice" DECIMAL(18,4),
  ADD COLUMN "dailyChangeAmount" DECIMAL(18,4),
  ADD COLUMN "marketStatus" "MarketStatus" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "priceTimestamp" TIMESTAMP(3);

UPDATE "MarketSnapshot"
SET "currentPrice" = "price",
    "priceTimestamp" = "timestamp";

ALTER TABLE "MarketSnapshot"
  ALTER COLUMN "priceTimestamp" SET NOT NULL;
