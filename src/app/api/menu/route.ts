import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({error: "Missing restaurantId"}, {status:400});

  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true }
        }
      }
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
