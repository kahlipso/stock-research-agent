import { describe, expect, it } from "vitest"; import { aggregateAlpha, candidateBand, compareRankings, confidenceScore, scoreFactor } from "../lib/research/factor-model";
describe("factor model", () => {
  it("uses V0 weights without confidence or risk in alpha", () => { const result = aggregateAlpha({ quality: 100, value: 0, growth: 0, momentum: 0 }); expect(result.alphaScore).toBe(30); });
  it("does not treat missing factors as bearish", () => expect(aggregateAlpha({ quality: 100, value: null, growth: 50, momentum: 50 }).alphaScore).toBeNull());
  it("reduces factor availability below the configured minimum", () => expect(scoreFactor([{ featureKey:"a", factor:"quality", percentile:80, weight:1 },{ featureKey:"b", factor:"quality", percentile:null, weight:1 },{ featureKey:"c", factor:"quality", percentile:null, weight:1 }]).score).toBeNull());
  it("classifies candidate and weak-signal bands", () => { expect(candidateBand(.9)).toBe("CANDIDATE"); expect(candidateBand(.29)).toBe("WEAK_SIGNAL"); });
  it("uses alpha, confidence, liquidity, then ticker tie-breaking", () => { const base = { alphaScore:80, confidenceScore:90, liquidityScore:90, eligible:true }; expect([{...base,ticker:"B"},{...base,ticker:"A"}].sort(compareRankings)[0].ticker).toBe("A"); });
  it("keeps confidence bounded", () => expect(confidenceScore({ featureCompleteness:100,freshness:100,providerConsistency:100,peerSample:100,factorCompleteness:100,filingFreshness:100,priceFreshness:100 })).toBe(100));
});
