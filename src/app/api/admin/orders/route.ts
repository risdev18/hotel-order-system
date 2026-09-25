import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

  try {
    const ordersSnap = await db.collection("orders").where("restaurantId", "==", restaurantId).get();
    
    // In Firebase, joins must be done manually
    // For simplicity, we just return the raw orders, and we'll fetch items in parallel
    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const enhancedOrders = await Promise.all(orders.map(async (order: any) => {
      const itemsSnap = await db.collection("orderItems").where("orderId", "==", order.id).get();
      const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch table info
      const tableDoc = await db.collection("tables").doc(order.tableId).get();
      const table = tableDoc.exists ? tableDoc.data() : { tableNumber: "Unknown" };

      return {
        ...order,
        items,
        table
      };
    }));

    return NextResponse.json({ orders: enhancedOrders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

  try {
    const { orderId, status } = await req.json();
    await db.collection("orders").doc(orderId).update({ status });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
