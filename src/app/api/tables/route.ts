import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

  try {
    const snapshot = await db.collection("tables").where("restaurantId", "==", restaurantId).get();
    const tables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

  try {
    const { tableNumber } = await req.json();
    
    // Check if table exists
    const existing = await db.collection("tables")
      .where("restaurantId", "==", restaurantId)
      .where("tableNumber", "==", tableNumber)
      .get();
      
    if (!existing.empty) {
      return NextResponse.json({ error: "Table already exists" }, { status: 400 });
    }

    const docRef = await db.collection("tables").add({
      restaurantId,
      tableNumber,
      status: "free",
      createdAt: new Date().toISOString()
    });

    const newTable = { id: docRef.id, restaurantId, tableNumber, status: "free" };
    return NextResponse.json({ success: true, table: newTable });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
