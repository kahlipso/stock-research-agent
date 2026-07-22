import { describe, expect, it } from "vitest";
import { normalizePriceHistory } from "../lib/market/price-history";
import type { PricePoint } from "../lib/data-providers/types";

const meta = { source: "mock", retrievedAt: "2026-07-01T20:00:00.000Z", isMock: true };
const point = (timestamp: string, price: number): PricePoint => ({ ...meta, timestamp, price });

describe("normalizePriceHistory", () => {
  it("sorts points chronologically", () => expect(normalizePriceHistory([point("2026-07-01T15:00:00Z", 2), point("2026-07-01T14:00:00Z", 1)]).map((item) => item.price)).toEqual([1, 2]));
  it("removes duplicate timestamps", () => expect(normalizePriceHistory([point("2026-07-01T14:00:00Z", 1), point("2026-07-01T14:00:00Z", 2)])).toHaveLength(1));
  it("does not interpolate a missing timestamp", () => expect(normalizePriceHistory([point("2026-07-01T14:00:00Z", 1), point("", 2), point("2026-07-01T16:00:00Z", 3)])).toHaveLength(2));
  it("accepts and preserves intraday timestamps", () => expect(normalizePriceHistory([point("2026-07-01T14:30:00Z", 1)])[0].timestamp).toBe("2026-07-01T14:30:00.000Z"));
});
