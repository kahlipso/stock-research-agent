import { MOCK_COMPANIES, MOCK_META, mockFinancials } from "./mock-data";
import type { MarketDataProvider, PriceRange } from "./types";
import { calculateDailyChange } from "../market/daily-change";
import { normalizePriceHistory } from "../market/price-history";
import { companyProfileSchema, financialPeriodSchema, marketSnapshotSchema, pricePointSchema, valuationSchema } from "../validation/provider";

const rangeSettings: Record<PriceRange, { points: number; intervalMinutes: number }> = {
  "1D": { points: 14, intervalMinutes: 30 }, "5D": { points: 20, intervalMinutes: 360 },
  "1M": { points: 22, intervalMinutes: 1440 }, "6M": { points: 26, intervalMinutes: 10080 },
  "1Y": { points: 52, intervalMinutes: 10080 }, "5Y": { points: 60, intervalMinutes: 43830 },
};
const pointMoves = [-.012, .006, -.004, .009, .002, -.007, .011, -.003, .005, -.001];

export class MockMarketDataProvider implements MarketDataProvider {
  private company(ticker: string) {
    const company = MOCK_COMPANIES.find((item) => item.ticker === ticker.toUpperCase());
    if (!company) throw new Error(`Mock data is unavailable for ${ticker.toUpperCase()}`);
    return company;
  }
  async getCompanyProfile(ticker: string) {
    const c = this.company(ticker);
    return companyProfileSchema.parse({ ...MOCK_META, ticker: c.ticker, name: c.name, sector: c.sector, industry: c.industry, description: c.description });
  }
  async getMarketSnapshot(ticker: string) {
    const c = this.company(ticker);
    const change = calculateDailyChange(c.price, c.previousClose);
    return marketSnapshotSchema.parse({ ...MOCK_META, ticker: c.ticker, previousClose: c.previousClose, currentPrice: c.price, ...change,
      marketStatus: "CLOSED", priceTimestamp: MOCK_META.retrievedAt, dataType: "MOCK",
      marketCap: c.marketCap, volume: c.volume, fiftyTwoWeekHigh: c.high, fiftyTwoWeekLow: c.low,
      fiftyDayMovingAverage: c.ma50, twoHundredDayMovingAverage: c.ma200 });
  }
  async getPriceHistory(ticker: string, range: PriceRange) {
    const c = this.company(ticker); const settings = rangeSettings[range]; const seed = c.ticker.charCodeAt(0);
    const prices = new Array<number>(settings.points); prices[settings.points - 1] = c.price;
    for (let index = settings.points - 2; index >= 0; index--) {
      const move = pointMoves[(index + seed) % pointMoves.length];
      prices[index] = Math.round((prices[index + 1] / (1 + move)) * 100) / 100;
    }
    const end = new Date(MOCK_META.retrievedAt);
    if (range === "1D") end.setUTCHours(20, 0, 0, 0);
    const raw = prices.map((price, index) => ({
      ...MOCK_META,
      timestamp: new Date(end.getTime() - (settings.points - index - 1) * settings.intervalMinutes * 60_000).toISOString(),
      price,
    }));
    return pricePointSchema.array().parse(normalizePriceHistory(raw));
  }
  async getFinancialPeriods(ticker: string) { return financialPeriodSchema.array().parse(mockFinancials(this.company(ticker))); }
  async getValuation(ticker: string) {
    const c = this.company(ticker);
    return valuationSchema.parse({ ...MOCK_META, ticker: c.ticker, trailingPE: c.trailingPE, forwardPE: c.forwardPE,
      priceToSales: c.ps, priceToFreeCashFlow: c.pfcf, evToEbitda: c.evEbitda });
  }
}

export const marketDataProvider = new MockMarketDataProvider();
