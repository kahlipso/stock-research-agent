import { apiError } from "@/lib/api-response";import { adminAuthorized } from "@/lib/auth/admin";
export async function POST(request:Request){if(!adminAuthorized(request))return apiError("UNAUTHORIZED","A valid server-side ingestion secret is required.",401);return apiError("WORKER_REQUIRED","Daily model calculation must run in the durable research worker.",409)}
