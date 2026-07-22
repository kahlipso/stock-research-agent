import { apiError } from "@/lib/api-response"; import { adminAuthorized } from "@/lib/auth/admin";
export async function POST(request: Request) { if (!adminAuthorized(request)) return apiError("UNAUTHORIZED", "A valid server-side ingestion secret is required.", 401); return apiError("WORKER_REQUIRED", "Price ingestion must run with npm run ingest:prices in the research worker.", 409); }
