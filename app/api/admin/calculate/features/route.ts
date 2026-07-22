import { apiError } from "@/lib/api-response"; import { adminAuthorized } from "@/lib/auth/admin";
export async function POST(request: Request) { if (!adminAuthorized(request)) return apiError("UNAUTHORIZED", "A valid server-side ingestion secret is required.", 401); return apiError("WORKER_REQUIRED", "Feature calculation must be run by the research worker CLI, not inside a Vercel request.", 409); }

