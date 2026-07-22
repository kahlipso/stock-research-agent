import { marketDataProvider } from "./provider";
import type { PriceRange, StockResearchData } from "./types";

export async function getStockResearchData(ticker: string, range: PriceRange = "1Y"): Promise<StockResearchData> {
  const [profile, market, prices, financials, valuation] = await Promise.all([
    marketDataProvider.getCompanyProfile(ticker), marketDataProvider.getMarketSnapshot(ticker),
    marketDataProvider.getPriceHistory(ticker, range), marketDataProvider.getFinancialPeriods(ticker),
    marketDataProvider.getValuation(ticker),
  ]);
  return { profile, market, prices, financials, valuation };
}
export * from "./types";
export { configuredProviderName, getMarketDataProvider, marketDataProvider } from "./provider";
