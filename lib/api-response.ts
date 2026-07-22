import { NextResponse } from "next/server";

export const apiError = (code: string, message: string, status: number, details?: unknown) =>
  NextResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
