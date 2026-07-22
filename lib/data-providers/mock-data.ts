import type { FinancialPeriodData } from "./types";

export const MOCK_SOURCE = "Educational mock dataset — not live market data";
export const MOCK_RETRIEVED_AT = "2026-07-01T16:00:00.000Z";
export const MOCK_META = { source: MOCK_SOURCE, retrievedAt: MOCK_RETRIEVED_AT, isMock: true } as const;

export type MockCompany = {
  ticker: string; name: string; sector: string; industry: string; description: string;
  price: number; previousClose: number; marketCap: number; volume: number;
  high: number; low: number; ma50: number; ma200: number;
  revenue: number; revenueGrowth: number; threeYearCagr: number; earningsGrowth: number;
  fcf: number; fcfGrowth: number; grossMargin: number; operatingMargin: number;
  netMargin: number; fcfMargin: number; roic: number | null; cash: number; debt: number;
  currentRatio: number | null; trailingPE: number | null; forwardPE: number | null;
  ps: number | null; pfcf: number | null; evEbitda: number | null;
};

const row = (ticker: string, name: string, sector: string, industry: string, price: number,
  marketCap: number, revenueGrowth: number, fcfMargin: number, forwardPE: number | null,
  high: number, seed: number): MockCompany => ({
  ticker, name, sector, industry,
  description: `${name} is represented by an educational company profile for interface development. This text and every financial value on this page are mock data, not current investment facts.`,
  price, previousClose: Math.round((price - ((seed % 7) - 3) * price * .005) * 100) / 100,
  marketCap, volume: (seed + 8) * 1_700_000,
  high, low: high * 0.57, ma50: price * (0.96 + (seed % 3) / 100), ma200: price * (0.87 + (seed % 5) / 100),
  revenue: marketCap * 0.19, revenueGrowth, threeYearCagr: revenueGrowth * 0.82,
  earningsGrowth: revenueGrowth * 1.12, fcf: marketCap * fcfMargin * 0.19,
  fcfGrowth: revenueGrowth * 0.9, grossMargin: 0.45 + (seed % 5) * 0.05,
  operatingMargin: Math.max(0.08, fcfMargin + 0.04), netMargin: Math.max(0.06, fcfMargin + 0.01),
  fcfMargin, roic: seed % 4 === 0 ? null : 0.12 + (seed % 8) / 100,
  cash: marketCap * (0.04 + (seed % 4) / 100), debt: marketCap * (0.015 + (seed % 3) / 100),
  currentRatio: seed % 6 === 0 ? null : 1.1 + (seed % 5) / 10,
  trailingPE: forwardPE === null ? null : forwardPE * 1.12, forwardPE,
  ps: 3 + (seed % 7) * 1.2, pfcf: 18 + seed, evEbitda: seed % 5 === 0 ? null : 14 + seed,
});

export const MOCK_COMPANIES: MockCompany[] = [
  row("NVDA", "NVIDIA Corporation", "Technology", "Semiconductors", 172, 4_190e9, .56, .46, 32, 184, 1),
  row("AMD", "Advanced Micro Devices", "Technology", "Semiconductors", 158, 256e9, .28, .18, 29, 187, 2),
  row("MSFT", "Microsoft Corporation", "Technology", "Software—Infrastructure", 498, 3_700e9, .15, .31, 28, 527, 3),
  row("AMZN", "Amazon.com, Inc.", "Consumer Cyclical", "Internet Retail", 226, 2_410e9, .12, .11, 27, 242, 4),
  row("GOOGL", "Alphabet Inc.", "Communication Services", "Internet Content", 194, 2_360e9, .14, .25, 21, 207, 5),
  row("META", "Meta Platforms, Inc.", "Communication Services", "Internet Content", 682, 1_720e9, .17, .29, 23, 741, 6),
  row("AVGO", "Broadcom Inc.", "Technology", "Semiconductors", 286, 1_350e9, .24, .39, 31, 301, 7),
  row("TSM", "Taiwan Semiconductor", "Technology", "Semiconductors", 231, 1_200e9, .31, .28, 22, 248, 8),
  row("ASML", "ASML Holding N.V.", "Technology", "Semiconductor Equipment", 812, 320e9, .10, .27, 26, 1_110, 9),
  row("MU", "Micron Technology", "Technology", "Memory Semiconductors", 124, 139e9, .38, .21, 12, 157, 10),
  row("CRM", "Salesforce, Inc.", "Technology", "Application Software", 274, 261e9, .09, .32, 24, 369, 11),
  row("NOW", "ServiceNow, Inc.", "Technology", "Application Software", 1_035, 214e9, .21, .34, 47, 1_198, 12),
  row("PANW", "Palo Alto Networks", "Technology", "Cybersecurity", 199, 133e9, .16, .35, 45, 208, 13),
  row("CRWD", "CrowdStrike Holdings", "Technology", "Cybersecurity", 488, 121e9, .22, .30, 67, 517, 14),
  row("PLTR", "Palantir Technologies", "Technology", "Infrastructure Software", 148, 352e9, .39, .41, null, 153, 15),
];

export function mockFinancials(company: MockCompany): FinancialPeriodData[] {
  return [0, 1, 2, 3].map((yearsAgo) => {
    const revenue = company.revenue / Math.pow(1 + company.threeYearCagr, yearsAgo);
    return {
      ...MOCK_META, ticker: company.ticker, periodEnd: `${2025 - yearsAgo}-12-31`, periodType: "ANNUAL",
      revenue, operatingIncome: revenue * company.operatingMargin, netIncome: revenue * company.netMargin,
      freeCashFlow: revenue * company.fcfMargin, cash: company.cash * (1 - yearsAgo * .04),
      debt: company.debt * (1 + yearsAgo * .03), sharesOutstanding: company.marketCap / company.price,
      grossMargin: company.grossMargin, operatingMargin: company.operatingMargin, netMargin: company.netMargin,
    };
  });
}
