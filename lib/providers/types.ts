export type DataLineage = {
  provider: string; sourceIdentifier: string | null; retrievedAt: string;
  effectiveAt: string | null; publishedAt: string | null; isMock: boolean;
};
export type SecurityMasterRecord = DataLineage & { ticker: string; exchange: string | null; companyName: string; sector: string | null; industry: string | null; country: string | null; currency: string | null; securityType: string | null };
export type CompanyProfileRecord = SecurityMasterRecord & { description: string | null };
export type PriceBarRecord = DataLineage & { ticker: string; timestamp: string; interval: "1d"; open: number; high: number; low: number; close: number; adjustedClose: number | null; volume: number | null };
export type LatestQuoteRecord = DataLineage & { ticker: string; price: number | null; previousClose: number | null; marketCap: number | null; volume: number | null; dataType: "DELAYED" | "LIVE" | "MOCK" };
export type CorporateActionRecord = DataLineage & { ticker: string; actionType: "DIVIDEND" | "SPLIT"; effectiveDate: string; ratio: number | null; cashAmount: number | null };
export type FilingRecord = DataLineage & { ticker: string; accessionNumber: string; formType: string; filingDate: string; periodEnd: string | null; acceptedAt: string | null; sourceUrl: string | null };
export type FinancialFactRecord = DataLineage & { ticker: string; accessionNumber: string | null; metricKey: string; value: string; unit: string; periodStart: string | null; periodEnd: string; fiscalYear: number | null; fiscalQuarter: string | null; periodType: "ANNUAL" | "QUARTERLY" | "INSTANT"; isRestated: boolean };

export interface SecurityMasterProvider { getSecurities(): Promise<SecurityMasterRecord[]>; getCompanyProfile(ticker: string): Promise<CompanyProfileRecord>; }
export interface PriceDataProvider {
  getDailyBars(ticker: string, startDate: string, endDate: string): Promise<PriceBarRecord[]>;
  getLatestQuote(ticker: string): Promise<LatestQuoteRecord>;
  getCorporateActions(ticker: string, startDate: string, endDate: string): Promise<CorporateActionRecord[]>;
}
export interface FundamentalsProvider { getFilings(ticker: string): Promise<FilingRecord[]>; getFinancialFacts(ticker: string): Promise<FinancialFactRecord[]>; }

