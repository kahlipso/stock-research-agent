import { describe, expect, it } from "vitest"; import { availableAsOf, FEATURE_BY_KEY, isApplicable, momentumFeatures, ratio, safeCagr, safeEpsGrowth, safeGrowth } from "../lib/research/features";
describe("research features and time integrity", () => {
  it("calculates growth and positive-base CAGR", () => { expect(safeGrowth(120,100)).toBeCloseTo(.2); expect(safeCagr(133.1,100,3)).toBeCloseTo(.1); });
  it("rejects meaningless CAGR bases", () => { expect(safeCagr(100,0,3)).toBeNull(); expect(safeCagr(-1,100,3)).toBeNull(); });
  it("calculates twelve-minus-one without the latest month", () => { const prices = Array.from({ length: 253 }, (_, i) => 100 + i); expect(momentumFeatures(prices).momentum_12_1).toBeCloseTo(331/100-1); });
  it("prevents unpublished and unretrieved facts from entering a past calculation", () => { const asOf = new Date("2025-03-01"); const rows = [{ publishedAt: new Date("2025-02-01"), retrievedAt: new Date("2025-02-02") }, { publishedAt: new Date("2025-04-01"), retrievedAt: new Date("2025-04-01") }]; expect(availableAsOf(rows, asOf)).toHaveLength(1); });
  it("rejects near-zero denominators and loss-to-loss EPS growth",()=>{expect(ratio(1,0)).toBeNull();expect(ratio(1,1e-12)).toBeNull();expect(safeEpsGrowth(-1,-2)).toBeNull()});
  it("does not treat financial-company leverage as ordinary industrial leverage",()=>expect(isApplicable(FEATURE_BY_KEY.get("net_debt_to_ebitda")!,"COMMON_STOCK","Banks")).toBe(false));
  it("requires adjusted observations for longer momentum windows",()=>expect(momentumFeatures(Array(125).fill(100)).momentum_6_1).toBeNull());
});
