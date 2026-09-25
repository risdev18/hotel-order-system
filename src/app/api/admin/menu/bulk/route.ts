import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const items = data.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    let itemsInserted = 0;
    const batch = db.batch();

    // Cache categories to avoid DB reads
    const categoriesMap = new Map<string, string>();
    const categorySnapshot = await db.collection("menuCategories").where("restaurantId", "==", restaurantId).get();
    categorySnapshot.docs.forEach(doc => {
      categoriesMap.set(doc.data().name.toLowerCase(), doc.id);
    });

    for (const item of items) {
      if (!item.name || !item.price || !item.categoryName) continue;
      const catKey = item.categoryName.toLowerCase();
      
      let categoryId = categoriesMap.get(catKey);

      if (!categoryId) {
        const newCatRef = db.collection("menuCategories").doc();
        batch.set(newCatRef, {
          name: item.categoryName,
          restaurantId,
          sortOrder: 0
        });
        categoryId = newCatRef.id;
        categoriesMap.set(catKey, categoryId);
      }

      const itemRef = db.collection("menuItems").doc();
      batch.set(itemRef, {
        name: item.name,
        price: parseFloat(item.price.toString()),
        vegFlag: item.vegFlag ?? true,
        categoryId,
        isAvailable: true,
        restaurantId
      });
      itemsInserted++;
    }

    await batch.commit();

    return NextResponse.json({ success: true, itemsInserted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
