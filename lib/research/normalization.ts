import type { Direction } from "./features";
import { DEFAULT_NORMALIZATION } from "./config";

export type Observation = { id: string; value: number | null; industry?: string | null; sector?: string | null };
export type NormalizedObservation = Observation & { winsorizedValue: number; percentileRank: number; normalizedValue: number; peerGroupType: "INDUSTRY" | "SECTOR" | "UNIVERSE"; peerGroupValue: string | null; peerGroupSize: number };

const quantile = (sorted: number[], p: number) => {
  const position = (sorted.length - 1) * p; const lower = Math.floor(position); const fraction = position - lower;
  return sorted[lower] + ((sorted[lower + 1] ?? sorted[lower]) - sorted[lower]) * fraction;
};
const percentile = (values: number[], value: number) => {
  if (values.length === 1) return 0.5;
  const less = values.filter((item) => item < value).length;
  const equal = values.filter((item) => item === value).length;
  return (less + (equal - 1) / 2) / (values.length - 1);
};

export function normalizeCrossSection(observations: Observation[], direction: Direction, config = DEFAULT_NORMALIZATION): NormalizedObservation[] {
  const available = observations.filter((item): item is Observation & { value: number } => item.value != null && Number.isFinite(item.value));
  const universeValues = available.map((item) => item.value).sort((a, b) => a - b);
  if (!universeValues.length) return [];
  const low = quantile(universeValues, config.lowerWinsorPercentile); const high = quantile(universeValues, config.upperWinsorPercentile);
  const winsorized = available.map((item) => ({ ...item, winsorizedValue: Math.min(high, Math.max(low, item.value)) }));
  return winsorized.map((item) => {
    const industry = winsorized.filter((peer) => item.industry && peer.industry === item.industry);
    const sector = winsorized.filter((peer) => item.sector && peer.sector === item.sector);
    const [peers, peerGroupType, peerGroupValue] = industry.length >= config.minimumIndustrySampleSize
      ? [industry, "INDUSTRY", item.industry] as const
      : sector.length >= config.minimumSectorSampleSize
        ? [sector, "SECTOR", item.sector] as const : [winsorized, "UNIVERSE", null] as const;
    const rawPercentile = percentile(peers.map((peer) => peer.winsorizedValue), item.winsorizedValue);
    const percentileRank = direction === "LOWER_IS_BETTER" ? 1 - rawPercentile : rawPercentile;
    return { ...item, percentileRank, normalizedValue: percentileRank * 100, peerGroupType, peerGroupValue: peerGroupValue ?? null, peerGroupSize: peers.length };
  });
}

