import { describe, expect, it } from "vitest";
import { filterAndRank, rankByResearchScore } from "../lib/ranking/watchlist";

const stock = (ticker: string, totalScore: number, dataCompletenessScore: number, growthScore: number) => ({ ticker, totalScore, dataCompletenessScore, growthScore });

describe("research ranking", () => {
  it("orders by total score descending", () => expect(rankByResearchScore([stock("LOW", 50, 10, 20), stock("HIGH", 90, 10, 20)]).map((row) => row.ticker)).toEqual(["HIGH", "LOW"]));
  it("resolves score ties by completeness", () => expect(rankByResearchScore([stock("A", 80, 8, 20), stock("B", 80, 10, 10)])[0].ticker).toBe("B"));
  it("resolves remaining ties by growth", () => expect(rankByResearchScore([stock("A", 80, 10, 15), stock("B", 80, 10, 20)])[0].ticker).toBe("B"));
  it("resolves final ties alphabetically", () => expect(rankByResearchScore([stock("ZZZ", 80, 10, 20), stock("AAA", 80, 10, 20)])[0].ticker).toBe("AAA"));
  it("recalculates visible rank numbers after filtering", () => {
    const result = filterAndRank([stock("A", 90, 10, 20), stock("B", 80, 10, 20)], (row) => row.ticker === "B");
    expect(result).toMatchObject([{ ticker: "B", rank: 1 }]);
  });
  it("restores score ranking after an alternate sort", () => {
    const rows = [stock("LOW", 50, 10, 20), stock("HIGH", 90, 10, 20)];
    const alternate = [...rows].sort((a, b) => a.ticker.localeCompare(b.ticker));
    expect(rankByResearchScore(alternate).map((row) => row.ticker)).toEqual(["HIGH", "LOW"]);
  });
});
