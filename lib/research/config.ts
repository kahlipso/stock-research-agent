export const MODEL_V0 = {
  modelKey: "MULTIFACTOR_V0",
  version: "1.0.0",
  name: "Liquid equity multifactor model",
  horizon: "1–3 months",
  weights: { quality: 0.25, value: 0.20, growth: 0.20, momentum: 0.35 },
  minimumFactorCompleteness: 0.5,
} as const;

export const MODEL_V1_INACTIVE = {
  modelKey: "MULTIFACTOR_V1",
  version: "1.0.0-draft",
  active: false,
  weights: { quality: 0.20, value: 0.15, growth: 0.15, revisions: 0.25, momentum: 0.25 },
} as const;

export const DEFAULT_UNIVERSE_RULES = {
  version: "LIQUID_US_V1",
  minimumMarketCapUsd: 5_000_000_000,
  minimumMedianDailyDollarVolumeUsd: 25_000_000,
  minimumPriceUsd: 5,
  minimumTradingHistoryDays: 252,
  allowedSecurityTypes: ["COMMON_STOCK", "ADR"],
  allowedCountries: ["US"],
} as const;

export const DEFAULT_NORMALIZATION = {
  lowerWinsorPercentile: 0.025,
  upperWinsorPercentile: 0.975,
  minimumIndustrySampleSize: 10,
  minimumSectorSampleSize: 20,
  method: "PERCENTILE" as const,
};

