import { describe, expect, it } from "vitest"; import { availableAsOf, momentumFeatures, safeCagr, safeGrowth } from "../lib/research/features";
describe("research features and time integrity", () => {
  it("calculates growth and positive-base CAGR", () => { expect(safeGrowth(120,100)).toBeCloseTo(.2); expect(safeCagr(133.1,100,3)).toBeCloseTo(.1); });
  it("rejects meaningless CAGR bases", () => { expect(safeCagr(100,0,3)).toBeNull(); expect(safeCagr(-1,100,3)).toBeNull(); });
  it("calculates twelve-minus-one without the latest month", () => { const prices = Array.from({ length: 253 }, (_, i) => 100 + i); expect(momentumFeatures(prices).momentum_12_1).toBeCloseTo(331/100-1); });
  it("prevents unpublished and unretrieved facts from entering a past calculation", () => { const asOf = new Date("2025-03-01"); const rows = [{ publishedAt: new Date("2025-02-01"), retrievedAt: new Date("2025-02-02") }, { publishedAt: new Date("2025-04-01"), retrievedAt: new Date("2025-04-01") }]; expect(availableAsOf(rows, asOf)).toHaveLength(1); });
});
