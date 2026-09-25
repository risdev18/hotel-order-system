import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const items = data.items; // Array of { name, price, categoryName, vegFlag }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    let itemsInserted = 0;

    for (const item of items) {
      if (!item.name || !item.price || !item.categoryName) continue;

      // Find or create category
      let category = await prisma.menuCategory.findFirst({
        where: {
          restaurantId,
          name: { equals: item.categoryName, mode: "insensitive" }
        }
      });

      if (!category) {
        category = await prisma.menuCategory.create({
          data: { name: item.categoryName, restaurantId }
        });
      }

      // Create item
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: parseFloat(item.price.toString()),
          vegFlag: item.vegFlag ?? true,
          categoryId: category.id,
        }
      });
      itemsInserted++;
    }

    return NextResponse.json({ success: true, itemsInserted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
