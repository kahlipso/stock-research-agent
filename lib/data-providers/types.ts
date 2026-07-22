export const PRICE_RANGES = ["1D", "5D", "1M", "6M", "1Y", "5Y"] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];
export const MARKET_STATUSES = ["PRE_MARKET", "OPEN", "AFTER_HOURS", "CLOSED", "UNKNOWN"] as const;
export type MarketStatus = (typeof MARKET_STATUSES)[number];

export type DataProvenance = { source: string; retrievedAt: string; isMock: boolean };
export type CompanyProfile = DataProvenance & {
  ticker: string; name: string; sector: string; industry: string; description: string;
};
export type MarketSnapshotData = DataProvenance & {
  ticker: string; previousClose: number | null; currentPrice: number | null;
  dailyChangeAmount: number | null; dailyChangePercent: number | null;
  marketStatus: MarketStatus; priceTimestamp: string; dataType: "MOCK" | "DELAYED" | "LIVE";
  marketCap: number | null; volume: number | null; fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null; fiftyDayMovingAverage: number | null;
  twoHundredDayMovingAverage: number | null;
};
export type PricePoint = DataProvenance & { timestamp: string; price: number; open?: number | null; high?: number | null; low?: number | null; close?: number | null; adjustedClose?: number | null; volume?: number | null };
export type FinancialPeriodData = DataProvenance & {
  ticker: string; periodEnd: string; periodType: "ANNUAL" | "QUARTERLY";
  revenue: number | null; operatingIncome: number | null; netIncome: number | null;
  freeCashFlow: number | null; cash: number | null; debt: number | null;
  sharesOutstanding: number | null; grossMargin: number | null;
  operatingMargin: number | null; netMargin: number | null;
  revenueGrowth: number | null; earningsGrowth: number | null; freeCashFlowGrowth: number | null;
  currentRatio: number | null; returnOnInvestedCapital: number | null;
};
export type ValuationData = DataProvenance & {
  ticker: string; trailingPE: number | null; forwardPE: number | null;
  priceToSales: number | null; priceToFreeCashFlow: number | null; evToEbitda: number | null;
};
export interface MarketDataProvider {
  getCompanyProfile(ticker: string): Promise<CompanyProfile>;
  getMarketSnapshot(ticker: string): Promise<MarketSnapshotData>;
  getPriceHistory(ticker: string, range: PriceRange): Promise<PricePoint[]>;
  getFinancialPeriods(ticker: string): Promise<FinancialPeriodData[]>;
  getValuation(ticker: string): Promise<ValuationData>;
}

export type StockResearchData = {
  profile: CompanyProfile; market: MarketSnapshotData; prices: PricePoint[];
  financials: FinancialPeriodData[]; valuation: ValuationData;
};
