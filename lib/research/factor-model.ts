import { MODEL_V0 } from "./config";

export type FactorName = keyof typeof MODEL_V0.weights;
export type Contribution = { featureKey: string; factor: FactorName; percentile: number | null; weight: number; dataAsOf?: string };

export function scoreFactor(contributions: Contribution[], minimumCompleteness = MODEL_V0.minimumFactorCompleteness) {
  const available = contributions.filter((item): item is Contribution & { percentile: number } => item.percentile != null && Number.isFinite(item.percentile));
  const completeness = contributions.length ? available.length / contributions.length : 0;
  if (completeness < minimumCompleteness || !available.length) return { score: null, completeness, contributions: available };
  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
  const score = available.reduce((sum, item) => sum + item.percentile * item.weight / totalWeight, 0);
  return { score, completeness, contributions: available };
}

export function aggregateAlpha(factors: Partial<Record<FactorName, number | null>>) {
  const required = Object.keys(MODEL_V0.weights) as FactorName[];
  if (required.some((key) => factors[key] == null)) return { alphaScore: null, effectiveWeights: {} };
  const alphaScore = required.reduce((sum, key) => sum + Number(factors[key]) * MODEL_V0.weights[key], 0);
  return { alphaScore, effectiveWeights: { ...MODEL_V0.weights } };
}

export function confidenceScore(input: { featureCompleteness: number; freshness: number; providerConsistency: number; peerSample: number; factorCompleteness: number; filingFreshness: number; priceFreshness: number }) {
  const weights = { featureCompleteness: .30, freshness: .10, providerConsistency: .10, peerSample: .10, factorCompleteness: .20, filingFreshness: .10, priceFreshness: .10 };
  return Math.max(0, Math.min(100, Object.entries(weights).reduce((sum, [key, weight]) => sum + input[key as keyof typeof input] * weight, 0)));
}

export function candidateBand(percentile: number | null, eligible = true, sufficient = true) {
  if (!eligible) return "INELIGIBLE";
  if (!sufficient || percentile == null) return "INSUFFICIENT_DATA";
  if (percentile >= .90) return "CANDIDATE";
  if (percentile >= .80) return "HOLD_RANGE";
  if (percentile < .70) return "EXIT_RANGE";
  return "NEUTRAL";
}

export type Rankable = { ticker: string; alphaScore: number | null; confidenceScore: number | null; liquidityScore: number | null; eligible: boolean };
export const compareRankings = (a: Rankable, b: Rankable) => Number(b.eligible) - Number(a.eligible)
  || (b.alphaScore ?? -1) - (a.alphaScore ?? -1)
  || (b.confidenceScore ?? -1) - (a.confidenceScore ?? -1)
  || (b.liquidityScore ?? -1) - (a.liquidityScore ?? -1)
  || a.ticker.localeCompare(b.ticker);

