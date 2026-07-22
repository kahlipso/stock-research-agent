ALTER TABLE "MarketSnapshot"
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "sourceIdentifier" TEXT,
  ADD COLUMN "retrievedAt" TIMESTAMP(3),
  ADD COLUMN "effectiveAt" TIMESTAMP(3),
  ADD COLUMN "isMock" BOOLEAN NOT NULL DEFAULT false;

UPDATE "MarketSnapshot"
SET "provider" = 'UNKNOWN_LEGACY',
    "retrievedAt" = "timestamp",
    "effectiveAt" = "priceTimestamp"
WHERE "provider" IS NULL;

ALTER TABLE "FactorScoreSnapshot" ADD COLUMN "modelCalculationRunId" TEXT;
CREATE INDEX "FactorScoreSnapshot_modelCalculationRunId_idx" ON "FactorScoreSnapshot"("modelCalculationRunId");
ALTER TABLE "FactorScoreSnapshot"
  ADD CONSTRAINT "FactorScoreSnapshot_modelCalculationRunId_fkey"
  FOREIGN KEY ("modelCalculationRunId") REFERENCES "ModelCalculationRun"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
