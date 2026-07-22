import { timingSafeEqual } from "node:crypto";
export function adminAuthorized(request: Request) {
  const secret = process.env.INGESTION_SECRET; const presented = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !presented) return false; const a = Buffer.from(secret); const b = Buffer.from(presented); return a.length === b.length && timingSafeEqual(a, b);
}

