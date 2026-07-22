import { describe, expect, it } from "vitest"; import { normalizeCrossSection } from "../lib/research/normalization";
const rows = (values: Array<number | null>) => values.map((value, index) => ({ id: String(index), value, industry: index < 10 ? "A" : "B", sector: "S" }));
describe("cross-sectional normalization", () => {
  it("winsorizes outliers and preserves missing values as absent", () => { const result = normalizeCrossSection(rows([1,2,3,4,5,6,7,8,9,1000,null]), "HIGHER_IS_BETTER"); expect(result).toHaveLength(10); expect(result.at(-1)?.winsorizedValue).toBeLessThan(1000); });
  it("uses industry groups at the minimum sample", () => expect(normalizeCrossSection(rows([1,2,3,4,5,6,7,8,9,10]), "HIGHER_IS_BETTER")[0].peerGroupType).toBe("INDUSTRY"));
  it("falls back to universe and reverses lower-is-better", () => { const result = normalizeCrossSection(rows([1,2,3]), "LOWER_IS_BETTER"); expect(result[0].peerGroupType).toBe("UNIVERSE"); expect(result[0].percentileRank).toBeGreaterThan(result[2].percentileRank); });
  it("gives identical values stable midranks", () => expect(normalizeCrossSection(rows([5,5,5]), "HIGHER_IS_BETTER").every((item) => item.percentileRank === .5)).toBe(true));
});
