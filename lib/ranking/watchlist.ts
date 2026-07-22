export type ResearchRankable = {
  ticker: string;
  totalScore: number;
  dataCompletenessScore: number;
  growthScore: number;
};
export const DEFAULT_RESEARCH_SORT = "RESEARCH_RANK" as const;

export function compareByResearchRank(a: ResearchRankable, b: ResearchRankable) {
  return b.totalScore - a.totalScore
    || b.dataCompletenessScore - a.dataCompletenessScore
    || b.growthScore - a.growthScore
    || a.ticker.localeCompare(b.ticker);
}

export function rankByResearchScore<T extends ResearchRankable>(stocks: T[]): Array<T & { rank: number }> {
  return [...stocks].sort(compareByResearchRank).map((stock, index) => ({ ...stock, rank: index + 1 }));
}

export function filterAndRank<T extends ResearchRankable>(stocks: T[], predicate: (stock: T) => boolean) {
  return rankByResearchScore(stocks.filter(predicate));
}

export function scoreLabel(score: number) {
  if (score >= 80) return "Strong research candidate";
  if (score >= 65) return "Worth researching";
  if (score >= 50) return "Mixed";
  return "Weak under current metrics";
}
