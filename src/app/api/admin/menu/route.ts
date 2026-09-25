import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { name, price, categoryName, vegFlag } = data;

    if (!name || !price || !categoryName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create category
    let category = await prisma.menuCategory.findFirst({
      where: {
        restaurantId,
        name: { equals: categoryName, mode: "insensitive" }
      }
    });

    if (!category) {
      category = await prisma.menuCategory.create({
        data: {
          name: categoryName,
          restaurantId,
        }
      });
    }

    // Create item
    const item = await prisma.menuItem.create({
      data: {
        name,
        price: parseFloat(price.toString()),
        vegFlag: vegFlag ?? true,
        categoryId: category.id,
      }
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
