import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

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
    let categorySnapshot = await db.collection("menuCategories")
      .where("restaurantId", "==", restaurantId)
      .where("name", "==", categoryName)
      .get();

    let categoryId = "";
    if (categorySnapshot.empty) {
      const catRef = await db.collection("menuCategories").add({
        name: categoryName,
        restaurantId,
        sortOrder: 0
      });
      categoryId = catRef.id;
    } else {
      categoryId = categorySnapshot.docs[0].id;
    }

    // Create item
    const itemRef = await db.collection("menuItems").add({
      name,
      price: parseFloat(price.toString()),
      vegFlag: vegFlag ?? true,
      categoryId,
      isAvailable: true,
      restaurantId, // Keep it for easier querying
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, item: { id: itemRef.id, name, price } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { itemId, isAvailable } = data;

    if (!itemId || isAvailable === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update availability
    await db.collection("menuItems").doc(itemId).update({
      isAvailable
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
