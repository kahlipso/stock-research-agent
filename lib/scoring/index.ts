import type { CategoryScore, MetricScore, ScoreBreakdown, ScoreInput } from "./types";

const finite = (value: number | null): value is number => value !== null && Number.isFinite(value);
const linear = (value: number, low: number, high: number, maximum: number, inverse = false) => {
  const ratio = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return Math.round((inverse ? 1 - ratio : ratio) * maximum * 100) / 100;
};
const metric = (label: string, value: number | null, maximum: number, low: number, high: number,
  unit: "percent" | "multiple" = "percent", inverse = false): MetricScore => {
  if (!finite(value)) return { label, score: null, maximum, explanation: `${label} is missing; no points were awarded.` };
  const score = linear(value, low, high, maximum, inverse);
  const shown = unit === "percent" ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}x`;
  return { label, score, maximum, explanation: `${label} is ${shown}; ${score.toFixed(2)} of ${maximum} points using capped linear thresholds.` };
};
const category = (metrics: MetricScore[], maximum: number): CategoryScore => {
  const score = Math.round(metrics.reduce((sum, item) => sum + (item.score ?? 0), 0) * 100) / 100;
  const missing = metrics.filter((item) => item.score === null).length;
  return { score, maximum, metrics, explanation: `${score.toFixed(2)} of ${maximum} points${missing ? `; ${missing} input${missing === 1 ? " was" : "s were"} missing` : ""}.` };
};

const FIELD_LABELS: Record<keyof ScoreInput, string> = {
  revenueGrowth: "Revenue growth", threeYearRevenueCagr: "Three-year revenue CAGR", earningsGrowth: "Earnings growth",
  grossMargin: "Gross margin", operatingMargin: "Operating margin", freeCashFlowMargin: "Free-cash-flow margin",
  cash: "Cash", debt: "Debt", freeCashFlow: "Free cash flow", currentRatio: "Current ratio",
  forwardPE: "Forward P/E", priceToSales: "Price-to-sales", priceToFreeCashFlow: "Price-to-free-cash-flow",
  price: "Price", fiftyDayMovingAverage: "50-day moving average", twoHundredDayMovingAverage: "200-day moving average",
  fiftyTwoWeekHigh: "52-week high",
};

export function calculateResearchScore(input: ScoreInput, calculatedAt: string): ScoreBreakdown {
  const growth = category([
    metric("Revenue growth", input.revenueGrowth, 10, -.1, .3),
    metric("Three-year revenue CAGR", input.threeYearRevenueCagr, 8, 0, .25),
    metric("Earnings growth", input.earningsGrowth, 7, -.15, .3),
  ], 25);
  const profitability = category([
    metric("Gross margin", input.grossMargin, 5, .2, .7),
    metric("Operating margin", input.operatingMargin, 7, 0, .35),
    metric("Free-cash-flow margin", input.freeCashFlowMargin, 8, 0, .3),
  ], 20);
  const netCashToFcf = finite(input.cash) && finite(input.debt) && finite(input.freeCashFlow) && input.freeCashFlow > 0
    ? (input.cash - input.debt) / input.freeCashFlow : null;
  const balanceSheet = category([
    metric("Net cash / free cash flow", netCashToFcf, 9, -5, 3, "multiple"),
    metric("Current ratio", input.currentRatio, 6, .7, 2, "multiple"),
  ], 15);
  const valuation = category([
    metric("Forward P/E", input.forwardPE, 8, 12, 45, "multiple", true),
    metric("Price-to-sales", input.priceToSales, 6, 2, 15, "multiple", true),
    metric("Price-to-free-cash-flow", input.priceToFreeCashFlow, 6, 15, 60, "multiple", true),
  ], 20);
  const priceVs50 = finite(input.price) && finite(input.fiftyDayMovingAverage) ? input.price / input.fiftyDayMovingAverage - 1 : null;
  const priceVs200 = finite(input.price) && finite(input.twoHundredDayMovingAverage) ? input.price / input.twoHundredDayMovingAverage - 1 : null;
  const distanceHigh = finite(input.price) && finite(input.fiftyTwoWeekHigh) && input.fiftyTwoWeekHigh > 0 ? input.price / input.fiftyTwoWeekHigh - 1 : null;
  const priceTrend = category([
    metric("Price vs. 50-day average", priceVs50, 3, -.15, .1),
    metric("Price vs. 200-day average", priceVs200, 4, -.25, .2),
    metric("Distance from 52-week high", distanceHigh, 3, -.5, 0),
  ], 10);
  const entries = Object.entries(input) as [keyof ScoreInput, number | null][];
  const missingFields = entries.filter(([, value]) => !finite(value)).map(([key]) => FIELD_LABELS[key]);
  const complete = entries.length - missingFields.length;
  const completenessScore = Math.round(complete / entries.length * 1000) / 100;
  const dataCompleteness = category([{
    label: "Required scoring inputs", score: completenessScore, maximum: 10,
    explanation: `${complete} of ${entries.length} scoring inputs are available.`,
  }], 10);
  const categories = { growth, profitability, balanceSheet, valuation, priceTrend, dataCompleteness };
  const totalScore = Math.round(Object.values(categories).reduce((sum, item) => sum + item.score, 0) * 100) / 100;
  return { totalScore: Math.min(100, totalScore), maximum: 100, categories, missingFields, calculatedAt,
    disclaimer: "This deterministic research score organizes mock data; it does not predict or guarantee future returns." };
}

export type { ScoreBreakdown, ScoreInput } from "./types";
