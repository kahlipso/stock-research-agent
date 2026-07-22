import type { MarketDataProvider } from "./types";
import { marketDataProvider as mockProvider } from "./mock-provider";
import { yahooMarketDataProvider } from "./yahoo-provider";

export type MarketDataProviderName = "mock" | "yahoo";
export function configuredProviderName(): MarketDataProviderName {
  const configured = process.env.MARKET_DATA_PROVIDER;
  if (!configured && process.env.NODE_ENV === "production") throw new Error("MARKET_DATA_PROVIDER is required in production");
  const value = (configured ?? "mock").trim().toLowerCase();
  if (value === "mock" || value === "yahoo") return value;
  throw new Error(`Unsupported MARKET_DATA_PROVIDER: ${value}`);
}
export function getMarketDataProvider(): MarketDataProvider {
  return configuredProviderName() === "yahoo" ? yahooMarketDataProvider : mockProvider;
}
export const marketDataProvider = getMarketDataProvider();
