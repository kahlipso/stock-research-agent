-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cik" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "delistedAt" TIMESTAMP(3),
ADD COLUMN     "exchange" TEXT,
ADD COLUMN     "securityType" TEXT;

-- AlterTable
ALTER TABLE "ResearchScore" ADD COLUMN     "isMock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "legacy" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "InvestmentUniverse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ruleVersion" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentUniverse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseMembership" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "retrievedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniverseMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceBar" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "interval" TEXT NOT NULL,
    "open" DECIMAL(20,6) NOT NULL,
    "high" DECIMAL(20,6) NOT NULL,
    "low" DECIMAL(20,6) NOT NULL,
    "close" DECIMAL(20,6) NOT NULL,
    "adjustedClose" DECIMAL(20,6),
    "volume" BIGINT,
    "provider" TEXT NOT NULL,
    "sourceIdentifier" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "effectiveAt" TIMESTAMP(3),
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "rawResponse" JSONB,

    CONSTRAINT "PriceBar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateAction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "ratio" DECIMAL(20,8),
    "cashAmount" DECIMAL(20,6),
    "provider" TEXT NOT NULL,
    "sourceIdentifier" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "isMock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CorporateAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filing" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accessionNumber" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "provider" TEXT NOT NULL,
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "isMock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Filing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialFact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filingId" TEXT,
    "metricKey" TEXT NOT NULL,
    "value" DECIMAL(30,8) NOT NULL,
    "unit" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fiscalYear" INTEGER,
    "fiscalQuarter" TEXT,
    "periodType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceIdentifier" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "isRestated" BOOLEAN NOT NULL DEFAULT false,
    "isMock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FinancialFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "featureKey" TEXT NOT NULL,
    "value" DECIMAL(30,10),
    "modelVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL,
    "sourceAsOf" TIMESTAMP(3),
    "confidence" DECIMAL(6,4),
    "metadata" JSONB,

    CONSTRAINT "FeatureSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormalizedFeatureSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "featureKey" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "rawValue" DECIMAL(30,10) NOT NULL,
    "winsorizedValue" DECIMAL(30,10) NOT NULL,
    "normalizedValue" DECIMAL(18,10) NOT NULL,
    "percentileRank" DECIMAL(8,6) NOT NULL,
    "peerGroupType" TEXT NOT NULL,
    "peerGroupValue" TEXT,
    "peerGroupSize" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "NormalizedFeatureSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactorModelVersion" (
    "id" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "horizon" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "configuration" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactorModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactorScoreSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "universeRuleVersion" TEXT NOT NULL,
    "qualityScore" DECIMAL(8,4),
    "valueScore" DECIMAL(8,4),
    "growthScore" DECIMAL(8,4),
    "revisionScore" DECIMAL(8,4),
    "momentumScore" DECIMAL(8,4),
    "alphaScore" DECIMAL(8,4),
    "confidenceScore" DECIMAL(8,4),
    "riskScore" DECIMAL(8,4),
    "liquidityScore" DECIMAL(8,4),
    "universePercentile" DECIMAL(8,6),
    "industryPercentile" DECIMAL(8,6),
    "sectorPercentile" DECIMAL(8,6),
    "candidateBand" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL,
    "dataAsOf" TIMESTAMP(3) NOT NULL,
    "priceAsOf" TIMESTAMP(3),
    "featureContributions" JSONB NOT NULL,
    "factorContributions" JSONB NOT NULL,
    "effectiveWeights" JSONB NOT NULL,
    "warnings" JSONB,
    "isMock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FactorScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskMetricSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "volatility20d" DECIMAL(18,10),
    "volatility60d" DECIMAL(18,10),
    "volatility252d" DECIMAL(18,10),
    "downsideVolatility" DECIMAL(18,10),
    "betaSpy" DECIMAL(18,10),
    "maximumDrawdown" DECIMAL(18,10),
    "atrPercent" DECIMAL(18,10),
    "gapRisk" DECIMAL(18,10),
    "riskScore" DECIMAL(8,4),
    "classification" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiquiditySnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "medianDollarVolume" DECIMAL(30,4),
    "averageDailyVolume" DECIMAL(30,4),
    "estimatedDaysToLiquidate" DECIMAL(18,8),
    "price" DECIMAL(20,6),
    "tradingHistoryDays" INTEGER NOT NULL,
    "missingBarCount" INTEGER NOT NULL,
    "liquidityScore" DECIMAL(8,4),
    "classification" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiquiditySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataIngestionRun" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "recordsRead" INTEGER NOT NULL DEFAULT 0,
    "recordsWritten" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" TEXT,
    "metadata" JSONB,

    CONSTRAINT "DataIngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRecord" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "dataAsOf" TIMESTAMP(3) NOT NULL,
    "staleAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "AnalysisRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentUniverse_name_key" ON "InvestmentUniverse"("name");

-- CreateIndex
CREATE INDEX "UniverseMembership_universeId_effectiveFrom_effectiveTo_idx" ON "UniverseMembership"("universeId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "UniverseMembership_universeId_companyId_effectiveFrom_key" ON "UniverseMembership"("universeId", "companyId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "PriceBar_companyId_timestamp_idx" ON "PriceBar"("companyId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PriceBar_companyId_timestamp_interval_provider_key" ON "PriceBar"("companyId", "timestamp", "interval", "provider");

-- CreateIndex
CREATE INDEX "CorporateAction_companyId_effectiveDate_idx" ON "CorporateAction"("companyId", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateAction_companyId_actionType_effectiveDate_provider_key" ON "CorporateAction"("companyId", "actionType", "effectiveDate", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Filing_accessionNumber_key" ON "Filing"("accessionNumber");

-- CreateIndex
CREATE INDEX "Filing_companyId_filingDate_idx" ON "Filing"("companyId", "filingDate");

-- CreateIndex
CREATE INDEX "FinancialFact_companyId_metricKey_periodEnd_idx" ON "FinancialFact"("companyId", "metricKey", "periodEnd");

-- CreateIndex
CREATE INDEX "FinancialFact_publishedAt_idx" ON "FinancialFact"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialFact_companyId_metricKey_periodEnd_publishedAt_pro_key" ON "FinancialFact"("companyId", "metricKey", "periodEnd", "publishedAt", "provider");

-- CreateIndex
CREATE INDEX "FeatureSnapshot_featureKey_asOfDate_idx" ON "FeatureSnapshot"("featureKey", "asOfDate");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureSnapshot_companyId_asOfDate_featureKey_modelVersion_key" ON "FeatureSnapshot"("companyId", "asOfDate", "featureKey", "modelVersion");

-- CreateIndex
CREATE INDEX "NormalizedFeatureSnapshot_featureKey_asOfDate_idx" ON "NormalizedFeatureSnapshot"("featureKey", "asOfDate");

-- CreateIndex
CREATE UNIQUE INDEX "NormalizedFeatureSnapshot_companyId_asOfDate_featureKey_mod_key" ON "NormalizedFeatureSnapshot"("companyId", "asOfDate", "featureKey", "modelVersion");

-- CreateIndex
CREATE UNIQUE INDEX "FactorModelVersion_modelKey_version_key" ON "FactorModelVersion"("modelKey", "version");

-- CreateIndex
CREATE INDEX "FactorScoreSnapshot_asOfDate_alphaScore_idx" ON "FactorScoreSnapshot"("asOfDate", "alphaScore");

-- CreateIndex
CREATE UNIQUE INDEX "FactorScoreSnapshot_companyId_asOfDate_modelVersionId_key" ON "FactorScoreSnapshot"("companyId", "asOfDate", "modelVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskMetricSnapshot_companyId_asOfDate_modelVersion_key" ON "RiskMetricSnapshot"("companyId", "asOfDate", "modelVersion");

-- CreateIndex
CREATE UNIQUE INDEX "LiquiditySnapshot_companyId_asOfDate_key" ON "LiquiditySnapshot"("companyId", "asOfDate");

-- CreateIndex
CREATE INDEX "DataIngestionRun_jobType_startedAt_idx" ON "DataIngestionRun"("jobType", "startedAt");

-- CreateIndex
CREATE INDEX "AnalysisRecord_companyId_generatedAt_idx" ON "AnalysisRecord"("companyId", "generatedAt");

-- CreateIndex
CREATE INDEX "Company_sector_idx" ON "Company"("sector");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- AddForeignKey
ALTER TABLE "UniverseMembership" ADD CONSTRAINT "UniverseMembership_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "InvestmentUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniverseMembership" ADD CONSTRAINT "UniverseMembership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBar" ADD CONSTRAINT "PriceBar_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateAction" ADD CONSTRAINT "CorporateAction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialFact" ADD CONSTRAINT "FinancialFact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialFact" ADD CONSTRAINT "FinancialFact_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureSnapshot" ADD CONSTRAINT "FeatureSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormalizedFeatureSnapshot" ADD CONSTRAINT "NormalizedFeatureSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactorScoreSnapshot" ADD CONSTRAINT "FactorScoreSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactorScoreSnapshot" ADD CONSTRAINT "FactorScoreSnapshot_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "FactorModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskMetricSnapshot" ADD CONSTRAINT "RiskMetricSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquiditySnapshot" ADD CONSTRAINT "LiquiditySnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRecord" ADD CONSTRAINT "AnalysisRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
