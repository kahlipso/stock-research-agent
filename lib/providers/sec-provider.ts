import type { FilingRecord, FinancialFactRecord, FundamentalsProvider } from "./types";

const SEC_BASE = "https://data.sec.gov";
const TAGS: Record<string, string> = {
  Revenues: "revenue", RevenueFromContractWithCustomerExcludingAssessedTax: "revenue",
  GrossProfit: "gross_profit", OperatingIncomeLoss: "operating_income", NetIncomeLoss: "net_income",
  NetCashProvidedByUsedInOperatingActivities: "operating_cash_flow", PaymentsToAcquirePropertyPlantAndEquipment: "capital_expenditure",
  Assets: "assets", StockholdersEquity: "stockholders_equity", CashAndCashEquivalentsAtCarryingValue: "cash",
  LongTermDebtAndFinanceLeaseObligationsCurrent: "debt", LongTermDebtCurrent: "debt_current",
  InterestExpenseNonOperating: "interest_expense", CommonStocksIncludingAdditionalPaidInCapital: "common_equity",
  WeightedAverageNumberOfDilutedSharesOutstanding: "diluted_shares", EarningsPerShareDiluted: "diluted_eps",
};

type SecSubmissions = { cik: string; filings: { recent: { accessionNumber: string[]; form: string[]; filingDate: string[]; reportDate: string[]; acceptanceDateTime: string[]; primaryDocument: string[] } } };
type SecFactValue = { val: number; start?: string; end: string; filed: string; accn: string; fy?: number; fp?: string; form: string };
type SecFacts = { facts: { "us-gaap"?: Record<string, { units: Record<string, SecFactValue[]> }> } };

export class SecEdgarProvider implements FundamentalsProvider {
  constructor(private readonly cikByTicker: Record<string, string>, private readonly userAgent = process.env.SEC_USER_AGENT ?? "") {}
  private headers() { if (!this.userAgent) throw new Error("SEC_USER_AGENT is required for SEC EDGAR requests"); return { "User-Agent": this.userAgent, Accept: "application/json" }; }
  private cik(ticker: string) { const cik = this.cikByTicker[ticker.toUpperCase()]; if (!cik) throw new Error(`No SEC CIK configured for ${ticker.toUpperCase()}`); return cik.padStart(10, "0"); }
  async getFilings(ticker: string): Promise<FilingRecord[]> {
    const retrievedAt = new Date().toISOString(); const cik = this.cik(ticker);
    const response = await fetch(`${SEC_BASE}/submissions/CIK${cik}.json`, { headers: this.headers() }); if (!response.ok) throw new Error(`SEC submissions failed: ${response.status}`);
    const data = await response.json() as SecSubmissions; const recent = data.filings.recent;
    return recent.accessionNumber.map((accessionNumber, index) => ({ provider: "SEC_EDGAR", sourceIdentifier: accessionNumber, retrievedAt, effectiveAt: recent.reportDate[index] ? new Date(`${recent.reportDate[index]}T00:00:00Z`).toISOString() : null, publishedAt: recent.acceptanceDateTime[index] ? new Date(recent.acceptanceDateTime[index]).toISOString() : new Date(`${recent.filingDate[index]}T00:00:00Z`).toISOString(), isMock: false, ticker: ticker.toUpperCase(), accessionNumber, formType: recent.form[index], filingDate: new Date(`${recent.filingDate[index]}T00:00:00Z`).toISOString(), periodEnd: recent.reportDate[index] ? new Date(`${recent.reportDate[index]}T00:00:00Z`).toISOString() : null, acceptedAt: recent.acceptanceDateTime[index] ? new Date(recent.acceptanceDateTime[index]).toISOString() : null, sourceUrl: `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accessionNumber.replaceAll("-", "")}/${recent.primaryDocument[index]}` }));
  }
  async getFinancialFacts(ticker: string): Promise<FinancialFactRecord[]> {
    const retrievedAt = new Date().toISOString(); const cik = this.cik(ticker);
    const response = await fetch(`${SEC_BASE}/api/xbrl/companyfacts/CIK${cik}.json`, { headers: this.headers() }); if (!response.ok) throw new Error(`SEC company facts failed: ${response.status}`);
    const data = await response.json() as SecFacts; const output: FinancialFactRecord[] = [];
    for (const [tag, metricKey] of Object.entries(TAGS)) for (const [unit, facts] of Object.entries(data.facts["us-gaap"]?.[tag]?.units ?? {})) for (const fact of facts) {
      const publishedAt = new Date(`${fact.filed}T00:00:00Z`).toISOString(); const periodType = fact.start ? (fact.fp === "FY" ? "ANNUAL" : "QUARTERLY") : "INSTANT";
      output.push({ provider: "SEC_EDGAR", sourceIdentifier: `${fact.accn}:${tag}:${fact.end}`, retrievedAt, effectiveAt: new Date(`${fact.end}T00:00:00Z`).toISOString(), publishedAt, isMock: false, ticker: ticker.toUpperCase(), accessionNumber: fact.accn, metricKey, value: String(fact.val), unit, periodStart: fact.start ? new Date(`${fact.start}T00:00:00Z`).toISOString() : null, periodEnd: new Date(`${fact.end}T00:00:00Z`).toISOString(), fiscalYear: fact.fy ?? null, fiscalQuarter: fact.fp ?? null, periodType, isRestated: false });
    }
    return output;
  }
}
