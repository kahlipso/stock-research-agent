import { prisma } from "../lib/database/prisma";
import { getMarketDataProvider } from "../lib/data-providers/provider";
import { normalizePriceHistory } from "../lib/market/price-history";
import { mapWithConcurrency, runTrackedJob } from "../lib/jobs/runner";

const command = process.argv[2];
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if ((process.env.MARKET_DATA_PROVIDER ?? "").toLowerCase() === "mock" && (process.env.NODE_ENV === "production" || process.env.ALLOW_MOCK_DATA !== "true")) throw new Error("Mock ingestion is blocked. Configure a real provider; fixtures require explicit ALLOW_MOCK_DATA=true outside production.");

async function prices() {
  const provider = getMarketDataProvider();
  if (provider.constructor.name === "MockMarketDataProvider") throw new Error("Fixture price ingestion is not permitted by this command");
  const companies = await prisma.company.findMany({ where: { active: true }, select: { id: true, ticker: true } });
  return runTrackedJob("daily-prices", "yahoo-finance2-unofficial", async () => {
    const results = await mapWithConcurrency(companies, 3, async (company) => {
      const points = normalizePriceHistory(await provider.getPriceHistory(company.ticker, "1Y")); let written = 0;
      for (const point of points) {
        await prisma.priceBar.upsert({ where: { companyId_timestamp_interval_provider: { companyId: company.id, timestamp: new Date(point.timestamp), interval: "1d", provider: point.source } }, update: { close: point.price, adjustedClose: point.price, retrievedAt: new Date(point.retrievedAt), isMock: point.isMock }, create: { companyId: company.id, timestamp: new Date(point.timestamp), interval: "1d", open: point.price, high: point.price, low: point.price, close: point.price, adjustedClose: point.price, provider: point.source, retrievedAt: new Date(point.retrievedAt), effectiveAt: new Date(point.timestamp), isMock: point.isMock } }); written++;
      }
      return written;
    });
    const failures = results.flatMap((result, index) => result.status === "rejected" ? [`${companies[index].ticker}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`] : []);
    return { recordsRead: companies.length, recordsWritten: results.reduce((sum, result) => sum + (result.status === "fulfilled" ? result.value : 0), 0), recordsFailed: failures.length, errors: failures };
  });
}

async function unavailable(job: string) { return runTrackedJob(job, "research-worker", async () => { throw new Error(`${job} worker is not configured; no data was changed.`); }); }
async function main() { if (command === "prices") console.log(await prices()); else if (["fundamentals", "features", "factors"].includes(command)) await unavailable(command); else throw new Error("Use prices, fundamentals, features, or factors"); }
main().finally(() => prisma.$disconnect());
