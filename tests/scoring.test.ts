import { describe, expect, it } from "vitest";
import { calculateResearchScore, type ScoreInput } from "../lib/scoring";

const best: ScoreInput = {
  revenueGrowth: .3, threeYearRevenueCagr: .25, earningsGrowth: .3,
  grossMargin: .7, operatingMargin: .35, freeCashFlowMargin: .3,
  cash: 400, debt: 100, freeCashFlow: 100, currentRatio: 2,
  forwardPE: 12, priceToSales: 2, priceToFreeCashFlow: 15,
  price: 100, fiftyDayMovingAverage: 100 / 1.1, twoHundredDayMovingAverage: 100 / 1.2,
  fiftyTwoWeekHigh: 100,
};
const calculatedAt = "2026-07-01T16:00:00.000Z";
const score = (input: ScoreInput) => calculateResearchScore(input, calculatedAt);

describe("calculateResearchScore", () => {
  it("returns 100 at favorable boundaries with complete data", () => {
    const result = score(best);
    expect(result.totalScore).toBe(100);
    expect(result.missingFields).toEqual([]);
  });
  it("clamps values beyond boundaries", () => {
    const result = score({ ...best, revenueGrowth: 10, forwardPE: -5 });
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.categories.growth.metrics[0].score).toBe(10);
    expect(result.categories.valuation.metrics[0].score).toBe(8);
  });
  it("keeps missing metrics explicit and reduces completeness", () => {
    const result = score({ ...best, forwardPE: null });
    expect(result.categories.valuation.metrics[0].score).toBeNull();
    expect(result.categories.dataCompleteness.score).toBeLessThan(10);
    expect(result.missingFields).toContain("Forward P/E");
  });
  it("treats non-finite external values as missing", () => {
    const result = score({ ...best, revenueGrowth: Number.NaN });
    expect(result.categories.growth.metrics[0].score).toBeNull();
    expect(result.missingFields).toContain("Revenue growth");
  });
  it("is deterministic", () => {
    expect(score(best)).toEqual(score(best));
  });
});
