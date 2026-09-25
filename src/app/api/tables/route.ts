import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: "asc" },
    });
    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tableNumber } = await req.json();

    if (!tableNumber) {
      return NextResponse.json({ error: "Table number is required" }, { status: 400 });
    }

    const newTable = await prisma.table.create({
      data: {
        tableNumber,
        qrCodeUrl: "", // We can generate this later or immediately
      },
    });

    return NextResponse.json({ table: newTable });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
