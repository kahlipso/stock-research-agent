import YahooFinance from "yahoo-finance2";
import type { MarketDataProvider, MarketStatus, PriceRange } from "./types";
import { calculateDailyChange } from "../market/daily-change";
import { normalizePriceHistory } from "../market/price-history";
import { companyProfileSchema, financialPeriodSchema, marketSnapshotSchema, pricePointSchema, valuationSchema } from "../validation/provider";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const SOURCE = "Yahoo Finance via yahoo-finance2 (unofficial, may be delayed)";
const TTL_MS = 5 * 60_000;
type CacheEntry<T> = { expiresAt: number; value: Promise<T> };
const summaryCache = new Map<string, CacheEntry<Awaited<ReturnType<typeof loadSummary>>>>();
const historyCache = new Map<string, CacheEntry<Awaited<ReturnType<typeof loadHistory>>>>();

function cached<T>(cache: Map<string, CacheEntry<T>>, key: string, loader: () => Promise<T>) {
  const existing = cache.get(key);
  if (existing && existing.expiresAt > Date.now()) return existing.value;
  const value = loader().catch((error) => { cache.delete(key); throw error; });
  cache.set(key, { expiresAt: Date.now() + TTL_MS, value });
  return value;
}

async function loadSummary(ticker: string) {
  const retrievedAt = new Date().toISOString();
  const result = await yahooFinance.quoteSummary(ticker, {
    modules: ["summaryProfile", "price", "summaryDetail", "financialData", "defaultKeyStatistics"],
  });
  return { result, retrievedAt };
}

const rangeOptions: Record<PriceRange, { milliseconds: number; interval: "5m" | "30m" | "1d" | "1wk"; includePrePost: boolean }> = {
  "1D": { milliseconds: 24 * 60 * 60_000, interval: "5m", includePrePost: true },
  "5D": { milliseconds: 5 * 24 * 60 * 60_000, interval: "30m", includePrePost: false },
  "1M": { milliseconds: 31 * 24 * 60 * 60_000, interval: "1d", includePrePost: false },
  "6M": { milliseconds: 183 * 24 * 60 * 60_000, interval: "1d", includePrePost: false },
  "1Y": { milliseconds: 366 * 24 * 60 * 60_000, interval: "1d", includePrePost: false },
  "5Y": { milliseconds: 5 * 366 * 24 * 60 * 60_000, interval: "1wk", includePrePost: false },
};

async function loadHistory(ticker: string, range: PriceRange) {
  const retrievedAt = new Date().toISOString(); const options = rangeOptions[range];
  const result = await yahooFinance.chart(ticker, {
    period1: new Date(Date.now() - options.milliseconds), period2: new Date(), interval: options.interval,
    includePrePost: options.includePrePost, return: "array",
  });
  const points = result.quotes.flatMap((quote) => quote.close === null ? [] : [{
    source: SOURCE, retrievedAt, isMock: false, timestamp: quote.date.toISOString(), price: quote.close,
  }]);
  return pricePointSchema.array().parse(normalizePriceHistory(points));
}

function marketStatus(value: string | undefined): MarketStatus {
  if (value === "REGULAR") return "OPEN";
  if (value === "PRE" || value === "PREPRE") return "PRE_MARKET";
  if (value === "POST" || value === "POSTPOST") return "AFTER_HOURS";
  if (value === "CLOSED") return "CLOSED";
  return "UNKNOWN";
}
const nullable = (value: number | undefined | null) => value ?? null;

export class YahooMarketDataProvider implements MarketDataProvider {
  private summary(ticker: string) {
    const symbol = ticker.trim().toUpperCase();
    return cached(summaryCache, symbol, () => loadSummary(symbol));
  }
  async getCompanyProfile(ticker: string) {
    const { result, retrievedAt } = await this.summary(ticker);
    const name = result.price?.longName ?? result.price?.shortName; const profile = result.summaryProfile;
    if (!name || !profile?.sector || !profile.industry || !profile.longBusinessSummary) throw new Error(`Yahoo Finance did not return a complete company profile for ${ticker.toUpperCase()}`);
    return companyProfileSchema.parse({ source: SOURCE, retrievedAt, isMock: false, ticker: ticker.toUpperCase(), name,
      sector: profile.sector, industry: profile.industry, description: profile.longBusinessSummary });
  }
  async getMarketSnapshot(ticker: string) {
    const { result, retrievedAt } = await this.summary(ticker); const price = result.price; const detail = result.summaryDetail;
    const currentPrice = nullable(price?.regularMarketPrice);
    const previousClose = nullable(price?.regularMarketPreviousClose ?? detail?.regularMarketPreviousClose ?? detail?.previousClose);
    return marketSnapshotSchema.parse({ source: SOURCE, retrievedAt, isMock: false, ticker: ticker.toUpperCase(), previousClose,
      currentPrice, ...calculateDailyChange(currentPrice, previousClose), marketStatus: marketStatus(price?.marketState),
      priceTimestamp: (price?.regularMarketTime ?? new Date(retrievedAt)).toISOString(), dataType: "DELAYED",
      marketCap: nullable(price?.marketCap ?? detail?.marketCap), volume: nullable(price?.regularMarketVolume ?? detail?.regularMarketVolume),
      fiftyTwoWeekHigh: nullable(detail?.fiftyTwoWeekHigh), fiftyTwoWeekLow: nullable(detail?.fiftyTwoWeekLow),
      fiftyDayMovingAverage: nullable(detail?.fiftyDayAverage), twoHundredDayMovingAverage: nullable(detail?.twoHundredDayAverage) });
  }
  getPriceHistory(ticker: string, range: PriceRange) {
    const symbol = ticker.trim().toUpperCase();
    return cached(historyCache, `${symbol}:${range}`, () => loadHistory(symbol, range));
  }
  async getFinancialPeriods(ticker: string) {
    const { result, retrievedAt } = await this.summary(ticker); const financial = result.financialData; const statistics = result.defaultKeyStatistics;
    const revenue = nullable(financial?.totalRevenue); const operatingMargin = nullable(financial?.operatingMargins);
    const netMargin = nullable(financial?.profitMargins); const periodEnd = statistics?.mostRecentQuarter ?? statistics?.lastFiscalYearEnd ?? new Date(retrievedAt);
    return financialPeriodSchema.array().parse([{ source: SOURCE, retrievedAt, isMock: false, ticker: ticker.toUpperCase(),
      periodEnd: periodEnd.toISOString().slice(0, 10), periodType: "QUARTERLY", revenue,
      operatingIncome: revenue !== null && operatingMargin !== null ? revenue * operatingMargin : null,
      netIncome: revenue !== null && netMargin !== null ? revenue * netMargin : null,
      freeCashFlow: nullable(financial?.freeCashflow), cash: nullable(financial?.totalCash), debt: nullable(financial?.totalDebt),
      sharesOutstanding: nullable(statistics?.sharesOutstanding), grossMargin: nullable(financial?.grossMargins), operatingMargin,
      netMargin, revenueGrowth: nullable(financial?.revenueGrowth), earningsGrowth: nullable(financial?.earningsGrowth),
      freeCashFlowGrowth: null, currentRatio: nullable(financial?.currentRatio), returnOnInvestedCapital: null }]);
  }
  async getValuation(ticker: string) {
    const { result, retrievedAt } = await this.summary(ticker); const detail = result.summaryDetail;
    const financial = result.financialData; const statistics = result.defaultKeyStatistics; const marketCap = detail?.marketCap ?? result.price?.marketCap;
    return valuationSchema.parse({ source: SOURCE, retrievedAt, isMock: false, ticker: ticker.toUpperCase(),
      trailingPE: nullable(detail?.trailingPE), forwardPE: nullable(detail?.forwardPE ?? statistics?.forwardPE),
      priceToSales: nullable(detail?.priceToSalesTrailing12Months),
      priceToFreeCashFlow: marketCap && financial?.freeCashflow && financial.freeCashflow > 0 ? marketCap / financial.freeCashflow : null,
      evToEbitda: statistics?.enterpriseValue && financial?.ebitda && financial.ebitda > 0 ? statistics.enterpriseValue / financial.ebitda : null });
  }
}

export const yahooMarketDataProvider = new YahooMarketDataProvider();
