import { z } from "zod";

const provenance = {
  source: z.string().min(1), retrievedAt: z.string().refine((value) => Number.isFinite(Date.parse(value)), "Invalid timestamp"), isMock: z.boolean(),
};
const nullableFinite = z.number().finite().nullable();
const timestamp = z.string().refine((value) => Number.isFinite(Date.parse(value)), "Invalid timestamp");

export const companyProfileSchema = z.object({
  ...provenance, ticker: z.string().min(1), name: z.string().min(1), sector: z.string().min(1),
  industry: z.string().min(1), description: z.string().min(1),
});
export const marketSnapshotSchema = z.object({
  ...provenance, ticker: z.string().min(1), previousClose: nullableFinite, currentPrice: nullableFinite,
  dailyChangeAmount: nullableFinite, dailyChangePercent: nullableFinite,
  marketStatus: z.enum(["PRE_MARKET", "OPEN", "AFTER_HOURS", "CLOSED", "UNKNOWN"]),
  priceTimestamp: timestamp, dataType: z.enum(["MOCK", "DELAYED", "LIVE"]),
  marketCap: nullableFinite, volume: nullableFinite, fiftyTwoWeekHigh: nullableFinite,
  fiftyTwoWeekLow: nullableFinite, fiftyDayMovingAverage: nullableFinite, twoHundredDayMovingAverage: nullableFinite,
});
export const pricePointSchema = z.object({ ...provenance, timestamp, price: z.number().finite() });
export const financialPeriodSchema = z.object({
  ...provenance, ticker: z.string().min(1), periodEnd: z.string().min(1), periodType: z.enum(["ANNUAL", "QUARTERLY"]),
  revenue: nullableFinite, operatingIncome: nullableFinite, netIncome: nullableFinite, freeCashFlow: nullableFinite,
  cash: nullableFinite, debt: nullableFinite, sharesOutstanding: nullableFinite, grossMargin: nullableFinite,
  operatingMargin: nullableFinite, netMargin: nullableFinite,
});
export const valuationSchema = z.object({
  ...provenance, ticker: z.string().min(1), trailingPE: nullableFinite, forwardPE: nullableFinite,
  priceToSales: nullableFinite, priceToFreeCashFlow: nullableFinite, evToEbitda: nullableFinite,
});
