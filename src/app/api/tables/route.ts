import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({error: "Missing restaurantId"}, {status:400});

  try {
    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { tableNumber: "asc" },
    });
    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl?.searchParams?.get("restaurantId");
  // Also allow body to have restaurantId

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
