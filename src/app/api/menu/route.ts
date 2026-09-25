import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    const categoriesSnap = await db.collection("menuCategories").where("restaurantId", "==", restaurantId).get();
    const itemsSnap = await db.collection("menuItems").where("restaurantId", "==", restaurantId).where("isAvailable", "==", true).get();

    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const categories = categoriesSnap.docs.map(doc => {
      const catData = doc.data();
      return {
        id: doc.id,
        name: catData.name,
        sortOrder: catData.sortOrder || 0,
        items: items.filter((item: any) => item.categoryId === doc.id)
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Menu fetch error", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
