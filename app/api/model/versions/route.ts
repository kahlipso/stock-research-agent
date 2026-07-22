import { NextResponse } from "next/server"; import { prisma } from "@/lib/database/prisma";
export async function GET(){return NextResponse.json({data:await prisma.factorModelVersion.findMany({orderBy:[{active:"desc"},{createdAt:"desc"}]})});}
