export type FactorKey = "quality" | "growth" | "value" | "momentum";

export type FactorModelConfiguration = {
  modelKey: string;
  version: string;
  horizon: string;
  factorWeights: Record<FactorKey, number>;
  factorDefinitions: Record<FactorKey, { featureWeights: Record<string, number>; minimumCoverage: number }>;
  minimumOverallCoverage: number;
  normalizationVersion: string;
  universeRulesVersion: string;
};

export const NORMALIZATION_V1 = "PERCENTILE_2_5_97_5_V1";
export const UNIVERSE_RULES_V1 = "LIQUID_US_V1";

export const MODEL_V0: FactorModelConfiguration & { name: string; weights: Record<FactorKey, number> } = {
  modelKey: "MULTIFACTOR_V0", version: "1.0.0", name: "Long-only multifactor equity ranking",
  horizon: "1-3 months",
  factorWeights: { quality: .30, growth: .25, value: .20, momentum: .25 },
  weights: { quality: .30, growth: .25, value: .20, momentum: .25 },
  factorDefinitions: {
    quality: { minimumCoverage: .60, featureWeights: { gross_margin:.10,operating_margin:.09,net_margin:.07,fcf_margin:.09,roa:.05,roe:.05,roic_approx:.05,gross_profitability:.05,ocf_to_net_income:.08,fcf_to_net_income:.06,accruals_ratio:.06,net_debt_to_ebitda:.05,debt_to_equity:.04,interest_coverage:.04,operating_margin_stability_3y:.04,earnings_stability_3y:.03,share_change_1y:.03,share_change_3y:.02 } },
    growth: { minimumCoverage: .60, featureWeights: { revenue_growth_1y:.15,revenue_cagr_3y:.15,eps_growth_1y:.13,eps_cagr_3y:.12,fcf_growth_1y:.10,fcf_cagr_3y:.10,revenue_growth_acceleration:.05,eps_growth_acceleration:.05,gross_margin_change:.05,operating_margin_change:.06,fcf_margin_change:.04 } },
    value: { minimumCoverage: .50, featureWeights: { earnings_yield:.20,fcf_yield:.20,ebit_to_ev:.15,ebitda_to_ev:.15,sales_to_ev:.10,book_to_market:.05,shareholder_yield:.05,historical_valuation_percentile:.10 } },
    momentum: { minimumCoverage: .75, featureWeights: { momentum_12_1:.25,momentum_6_1:.20,return_3m:.12,relative_spy_6m:.06,relative_qqq_6m:.04,relative_sector_6m:.03,vol_adjusted_12_1:.06,vol_adjusted_6_1:.05,distance_200dma:.05,distance_52w_high:.05,short_term_reversal:.05,volume_trend:.02,return_1m:.02 } },
  },
  minimumOverallCoverage: .70, normalizationVersion: NORMALIZATION_V1, universeRulesVersion: UNIVERSE_RULES_V1,
};

export const MODEL_V1_INACTIVE = { modelKey:"MULTIFACTOR_V1",version:"1.0.0-draft",active:false,weights:{quality:.20,value:.15,growth:.15,revisions:.25,momentum:.25} } as const;

export const DEFAULT_UNIVERSE_RULES = { version:UNIVERSE_RULES_V1,minimumMarketCapUsd:5_000_000_000,minimumMedianDailyDollarVolumeUsd:25_000_000,minimumPriceUsd:5,minimumTradingHistoryDays:252,allowedSecurityTypes:["COMMON_STOCK","ADR"],allowedCountries:["US"] } as const;
export const DEFAULT_NORMALIZATION = { version:NORMALIZATION_V1,method:"PERCENTILE" as const,lowerWinsorPercentile:.025,upperWinsorPercentile:.975,minimumIndustrySampleSize:10,minimumSectorSampleSize:20 };

export function validateModelConfiguration(config: FactorModelConfiguration) {
  const sum = (values:number[]) => values.reduce((a,b)=>a+b,0);
  if (Math.abs(sum(Object.values(config.factorWeights))-1)>1e-9) throw new Error("Factor weights must sum to 1");
  for (const [factor, definition] of Object.entries(config.factorDefinitions)) {
    if (Math.abs(sum(Object.values(definition.featureWeights))-1)>1e-9) throw new Error(`${factor} feature weights must sum to 1`);
    if (definition.minimumCoverage < 0 || definition.minimumCoverage > 1) throw new Error(`${factor} minimum coverage must be within 0-1`);
  }
  return config;
}
validateModelConfiguration(MODEL_V0);
