import { describe, expect, it } from "vitest";
import { calculateDailyChange } from "../lib/market/daily-change";

describe("calculateDailyChange", () => {
  it("calculates positive movement", () => expect(calculateDailyChange(103.21, 100)).toEqual({ dailyChangeAmount: 3.21, dailyChangePercent: 3.21 }));
  it("calculates negative movement", () => expect(calculateDailyChange(97.55, 100)).toEqual({ dailyChangeAmount: -2.45, dailyChangePercent: -2.45 }));
  it("calculates an unchanged price", () => expect(calculateDailyChange(100, 100)).toEqual({ dailyChangeAmount: 0, dailyChangePercent: 0 }));
  it("preserves missing previous close", () => expect(calculateDailyChange(100, null)).toEqual({ dailyChangeAmount: null, dailyChangePercent: null }));
  it("does not divide by a zero previous close", () => expect(calculateDailyChange(100, 0)).toEqual({ dailyChangeAmount: 100, dailyChangePercent: null }));
  it("preserves missing current price", () => expect(calculateDailyChange(null, 100)).toEqual({ dailyChangeAmount: null, dailyChangePercent: null }));
});
