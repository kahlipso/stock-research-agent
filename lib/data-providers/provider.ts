import type { MarketDataProvider } from "./types";
import { marketDataProvider as mockProvider } from "./mock-provider";
import { yahooMarketDataProvider } from "./yahoo-provider";

export type MarketDataProviderName = "mock" | "yahoo";
export function configuredProviderName(): MarketDataProviderName {
  const value = (process.env.MARKET_DATA_PROVIDER ?? "mock").trim().toLowerCase();
  if (value === "mock" || value === "yahoo") return value;
  throw new Error(`Unsupported MARKET_DATA_PROVIDER: ${value}`);
}
export function getMarketDataProvider(): MarketDataProvider {
  return configuredProviderName() === "yahoo" ? yahooMarketDataProvider : mockProvider;
}
export const marketDataProvider = getMarketDataProvider();
