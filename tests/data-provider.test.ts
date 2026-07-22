import { afterEach, describe, expect, it } from "vitest";
import { configuredProviderName, getMarketDataProvider } from "../lib/data-providers/provider";

const originalProvider = process.env.MARKET_DATA_PROVIDER;
afterEach(() => {
  if (originalProvider === undefined) delete process.env.MARKET_DATA_PROVIDER;
  else process.env.MARKET_DATA_PROVIDER = originalProvider;
});

describe("market data provider selection", () => {
  it("defaults to deterministic mock data", () => {
    delete process.env.MARKET_DATA_PROVIDER;
    expect(configuredProviderName()).toBe("mock");
  });
  it("selects Yahoo only when explicitly configured", () => {
    process.env.MARKET_DATA_PROVIDER = "yahoo";
    expect(configuredProviderName()).toBe("yahoo");
    expect(getMarketDataProvider().constructor.name).toBe("YahooMarketDataProvider");
  });
  it("rejects unsupported provider names", () => {
    process.env.MARKET_DATA_PROVIDER = "unknown";
    expect(() => configuredProviderName()).toThrow("Unsupported MARKET_DATA_PROVIDER");
  });
  it("returns validated provenance from the mock provider", async () => {
    process.env.MARKET_DATA_PROVIDER = "mock";
    const snapshot = await getMarketDataProvider().getMarketSnapshot("MSFT");
    expect(snapshot).toMatchObject({ ticker: "MSFT", isMock: true, dataType: "MOCK" });
    expect(snapshot.dailyChangeAmount).not.toBeNull();
  });
});
