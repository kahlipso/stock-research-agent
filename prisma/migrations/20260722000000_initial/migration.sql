CREATE TYPE "WatchlistStatus" AS ENUM ('RESEARCHING', 'WATCHING', 'READY_TO_BUY', 'OWNED', 'AVOID');
CREATE TYPE "PeriodType" AS ENUM ('ANNUAL', 'QUARTERLY');

CREATE TABLE "Company" (
  "id" TEXT NOT NULL, "ticker" TEXT NOT NULL, "name" TEXT NOT NULL, "sector" TEXT NOT NULL,
  "industry" TEXT NOT NULL, "description" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

CREATE TABLE "WatchlistItem" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "personalNotes" TEXT, "targetPrice" DECIMAL(18,4), "status" "WatchlistStatus" NOT NULL DEFAULT 'RESEARCHING',
  CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WatchlistItem_companyId_key" ON "WatchlistItem"("companyId");

CREATE TABLE "MarketSnapshot" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "timestamp" TIMESTAMP(3) NOT NULL, "price" DECIMAL(18,4),
  "dailyChangePercent" DECIMAL(12,8), "marketCap" DECIMAL(24,2), "volume" BIGINT,
  "fiftyTwoWeekHigh" DECIMAL(18,4), "fiftyTwoWeekLow" DECIMAL(18,4), "fiftyDayMovingAverage" DECIMAL(18,4),
  "twoHundredDayMovingAverage" DECIMAL(18,4), CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MarketSnapshot_companyId_timestamp_idx" ON "MarketSnapshot"("companyId", "timestamp");

CREATE TABLE "FinancialPeriod" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "periodEnd" TIMESTAMP(3) NOT NULL, "periodType" "PeriodType" NOT NULL,
  "revenue" DECIMAL(24,2), "operatingIncome" DECIMAL(24,2), "netIncome" DECIMAL(24,2), "freeCashFlow" DECIMAL(24,2),
  "cash" DECIMAL(24,2), "debt" DECIMAL(24,2), "sharesOutstanding" DECIMAL(24,2), "grossMargin" DECIMAL(12,8),
  "operatingMargin" DECIMAL(12,8), "netMargin" DECIMAL(12,8), "source" TEXT NOT NULL, "retrievedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancialPeriod_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinancialPeriod_companyId_periodEnd_periodType_key" ON "FinancialPeriod"("companyId", "periodEnd", "periodType");

CREATE TABLE "ValuationSnapshot" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "timestamp" TIMESTAMP(3) NOT NULL, "trailingPE" DECIMAL(18,4),
  "forwardPE" DECIMAL(18,4), "priceToSales" DECIMAL(18,4), "priceToFreeCashFlow" DECIMAL(18,4), "evToEbitda" DECIMAL(18,4),
  CONSTRAINT "ValuationSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ValuationSnapshot_companyId_timestamp_idx" ON "ValuationSnapshot"("companyId", "timestamp");

CREATE TABLE "ResearchScore" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "growthScore" DECIMAL(6,2) NOT NULL, "profitabilityScore" DECIMAL(6,2) NOT NULL, "balanceSheetScore" DECIMAL(6,2) NOT NULL,
  "valuationScore" DECIMAL(6,2) NOT NULL, "momentumScore" DECIMAL(6,2) NOT NULL, "dataCompletenessScore" DECIMAL(6,2) NOT NULL,
  "totalScore" DECIMAL(6,2) NOT NULL, "explanation" JSONB NOT NULL, CONSTRAINT "ResearchScore_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ResearchScore_companyId_calculatedAt_idx" ON "ResearchScore"("companyId", "calculatedAt");

ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ValuationSnapshot" ADD CONSTRAINT "ValuationSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResearchScore" ADD CONSTRAINT "ResearchScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
