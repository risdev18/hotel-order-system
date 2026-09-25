import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const doc = await db.collection("restaurants").doc(restaurantId).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ settings: doc.data() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, tableCount } = await req.json();
    await db.collection("restaurants").doc(restaurantId).update({
      name,
      tableCount: parseInt(tableCount)
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
