import { prisma } from "@/lib/database/prisma";
import type { Prisma } from "@prisma/client";

export type JobResult = { recordsRead: number; recordsWritten: number; recordsFailed: number; errors?: string[]; metadata?: Record<string, unknown> };
export async function runTrackedJob(jobType: string, provider: string, work: () => Promise<JobResult>) {
  const run = await prisma.dataIngestionRun.create({ data: { jobType, provider, startedAt: new Date(), status: "RUNNING" } });
  try {
    const result = await work(); const status = result.recordsFailed ? "PARTIAL" : "COMPLETED";
    await prisma.dataIngestionRun.update({ where: { id: run.id }, data: { completedAt: new Date(), status, recordsRead: result.recordsRead, recordsWritten: result.recordsWritten, recordsFailed: result.recordsFailed, errorSummary: result.errors?.slice(0, 20).join("\n"), metadata: result.metadata as Prisma.InputJsonValue | undefined } });
    return { runId: run.id, status, ...result };
  } catch (error) {
    await prisma.dataIngestionRun.update({ where: { id: run.id }, data: { completedAt: new Date(), status: "FAILED", errorSummary: error instanceof Error ? error.message : "Unknown job error" } }); throw error;
  }
}

export async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>) {
  const results: PromiseSettledResult<R>[] = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => { while (next < items.length) { const index = next++; try { results[index] = { status: "fulfilled", value: await worker(items[index]) }; } catch (reason) { results[index] = { status: "rejected", reason }; } } })); return results;
}
