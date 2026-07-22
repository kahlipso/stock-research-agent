export type Direction = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
export type FeatureDefinition = {
  key: string; factor: "quality" | "value" | "growth" | "momentum" | "revisions";
  direction: Direction; minimumHistoryDays?: number; applicable?: "NON_FINANCIAL" | "ALL";
};

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  { key: "gross_profitability", factor: "quality", direction: "HIGHER_IS_BETTER", applicable: "NON_FINANCIAL" },
  { key: "gross_margin", factor: "quality", direction: "HIGHER_IS_BETTER" },
  { key: "operating_margin", factor: "quality", direction: "HIGHER_IS_BETTER" },
  { key: "net_margin", factor: "quality", direction: "HIGHER_IS_BETTER" },
  { key: "fcf_margin", factor: "quality", direction: "HIGHER_IS_BETTER" },
  { key: "roa", factor: "quality", direction: "HIGHER_IS_BETTER" },
  { key: "ocf_to_net_income", factor: "quality", direction: "HIGHER_IS_BETTER" },
  { key: "accruals_ratio", factor: "quality", direction: "LOWER_IS_BETTER" },
  { key: "net_debt_to_ebitda", factor: "quality", direction: "LOWER_IS_BETTER", applicable: "NON_FINANCIAL" },
  { key: "interest_coverage", factor: "quality", direction: "HIGHER_IS_BETTER", applicable: "NON_FINANCIAL" },
  { key: "share_dilution_1y", factor: "quality", direction: "LOWER_IS_BETTER" },
  { key: "earnings_yield", factor: "value", direction: "HIGHER_IS_BETTER" },
  { key: "fcf_yield", factor: "value", direction: "HIGHER_IS_BETTER" },
  { key: "ebit_to_ev", factor: "value", direction: "HIGHER_IS_BETTER", applicable: "NON_FINANCIAL" },
  { key: "sales_to_ev", factor: "value", direction: "HIGHER_IS_BETTER", applicable: "NON_FINANCIAL" },
  { key: "book_to_market", factor: "value", direction: "HIGHER_IS_BETTER" },
  { key: "revenue_growth_1y", factor: "growth", direction: "HIGHER_IS_BETTER" },
  { key: "revenue_cagr_3y", factor: "growth", direction: "HIGHER_IS_BETTER" },
  { key: "eps_growth_1y", factor: "growth", direction: "HIGHER_IS_BETTER" },
  { key: "eps_cagr_3y", factor: "growth", direction: "HIGHER_IS_BETTER" },
  { key: "fcf_growth_1y", factor: "growth", direction: "HIGHER_IS_BETTER" },
  { key: "gross_margin_change", factor: "growth", direction: "HIGHER_IS_BETTER" },
  { key: "operating_margin_change", factor: "growth", direction: "HIGHER_IS_BETTER" },
  { key: "momentum_12_1", factor: "momentum", direction: "HIGHER_IS_BETTER", minimumHistoryDays: 252 },
  { key: "momentum_6_1", factor: "momentum", direction: "HIGHER_IS_BETTER", minimumHistoryDays: 126 },
  { key: "return_3m", factor: "momentum", direction: "HIGHER_IS_BETTER", minimumHistoryDays: 63 },
  { key: "return_1m", factor: "momentum", direction: "HIGHER_IS_BETTER", minimumHistoryDays: 21 },
  { key: "distance_200dma", factor: "momentum", direction: "HIGHER_IS_BETTER", minimumHistoryDays: 200 },
  { key: "distance_52w_high", factor: "momentum", direction: "HIGHER_IS_BETTER", minimumHistoryDays: 252 },
  { key: "short_term_reversal", factor: "momentum", direction: "LOWER_IS_BETTER", minimumHistoryDays: 5 },
];

export const safeGrowth = (current: number | null, prior: number | null) =>
  current == null || prior == null || prior === 0 ? null : current / Math.abs(prior) - Math.sign(prior);

export const safeCagr = (current: number | null, base: number | null, years: number) =>
  current == null || base == null || current <= 0 || base <= 0 || years <= 0 ? null : Math.pow(current / base, 1 / years) - 1;

export const ratio = (numerator: number | null, denominator: number | null) =>
  numerator == null || denominator == null || denominator === 0 ? null : numerator / denominator;

export function priceReturn(prices: number[], endOffset: number, startOffset: number) {
  const end = prices.at(-(endOffset + 1)); const start = prices.at(-(startOffset + 1));
  return end == null || start == null || start <= 0 ? null : end / start - 1;
}

export function momentumFeatures(adjustedCloses: number[]) {
  return {
    momentum_12_1: priceReturn(adjustedCloses, 21, 252),
    momentum_6_1: priceReturn(adjustedCloses, 21, 126),
    return_3m: priceReturn(adjustedCloses, 0, 63),
    return_1m: priceReturn(adjustedCloses, 0, 21),
    short_term_reversal: priceReturn(adjustedCloses, 0, 5),
  };
}

export function availableAsOf<T extends { publishedAt: Date; retrievedAt: Date }>(rows: T[], asOf: Date) {
  return rows.filter((row) => row.publishedAt <= asOf && row.retrievedAt <= asOf);
}

