import { NextResponse } from "next/server"; import { prisma } from "@/lib/database/prisma";
export async function GET() { const universe = await prisma.investmentUniverse.findFirst({ where: { active: true }, include: { _count: { select: { memberships: true } } } }); return NextResponse.json({ data: universe }); }

