import { apiError } from "@/lib/api-response";import { adminAuthorized } from "@/lib/auth/admin";
export async function POST(r:Request){if(!adminAuthorized(r))return apiError("UNAUTHORIZED","Unauthorized.",401);return apiError("WORKER_REQUIRED","Normalization must run in the durable research worker.",409)}
