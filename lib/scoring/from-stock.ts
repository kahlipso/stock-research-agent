import type { StockResearchData } from "@/lib/data-providers";
import { MOCK_COMPANIES } from "@/lib/data-providers/mock-data";
import { calculateResearchScore } from ".";

export function scoreStock(data: StockResearchData) {
  const latest = data.financials[0];
  const previous = data.financials[1];
  const mock = MOCK_COMPANIES.find((item) => item.ticker === data.profile.ticker);
  return calculateResearchScore({
    revenueGrowth: latest?.revenue && previous?.revenue ? latest.revenue / previous.revenue - 1 : null,
    threeYearRevenueCagr: latest?.revenue && data.financials[3]?.revenue ? Math.pow(latest.revenue / data.financials[3].revenue, 1 / 3) - 1 : null,
    earningsGrowth: mock?.earningsGrowth ?? null, grossMargin: latest?.grossMargin ?? null,
    operatingMargin: latest?.operatingMargin ?? null,
    freeCashFlowMargin: latest?.freeCashFlow && latest?.revenue ? latest.freeCashFlow / latest.revenue : null,
    cash: latest?.cash ?? null, debt: latest?.debt ?? null, freeCashFlow: latest?.freeCashFlow ?? null,
    currentRatio: mock?.currentRatio ?? null, forwardPE: data.valuation.forwardPE,
    priceToSales: data.valuation.priceToSales, priceToFreeCashFlow: data.valuation.priceToFreeCashFlow,
    price: data.market.currentPrice, fiftyDayMovingAverage: data.market.fiftyDayMovingAverage,
    twoHundredDayMovingAverage: data.market.twoHundredDayMovingAverage, fiftyTwoWeekHigh: data.market.fiftyTwoWeekHigh,
  }, data.market.retrievedAt);
}
