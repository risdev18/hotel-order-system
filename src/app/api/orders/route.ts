import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  let restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl?.searchParams?.get("restaurantId");
  if (!restaurantId) return NextResponse.json({error: "Missing restaurantId"}, {status:400});

  try {
    const { tableId, items } = await req.json();

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // Check if there is an active unpaid order for this table to append to, or create new.
    let orderSnapshot = await db.collection("orders")
      .where("tableId", "==", tableId)
      .where("restaurantId", "==", restaurantId)
      .where("paymentStatus", "==", "unpaid")
      .get();
      
    // Filter out "paid" statuses if needed, though paymentStatus unpaid handles it.
    let order: any = null;
    let orderRef: any = null;
    
    if (!orderSnapshot.empty) {
      for (const doc of orderSnapshot.docs) {
        if (doc.data().status !== "paid") {
          order = { id: doc.id, ...doc.data() };
          orderRef = doc.ref;
          break;
        }
      }
    }

    if (!order) {
      const doc = await db.collection("orders").add({
        tableId,
        restaurantId,
        status: "placed",
        paymentStatus: "unpaid",
        createdAt: new Date().toISOString()
      });
      orderRef = doc;
      order = { id: doc.id, tableId, restaurantId, status: "placed" };
    } else {
      await orderRef.update({ status: "placed", updatedAt: new Date().toISOString() });
      order.status = "placed";
    }

    // Create Order Items
    const batch = db.batch();
    for (const item of items) {
      const itemRef = db.collection("orderItems").doc();
      batch.set(itemRef, {
        orderId: order.id,
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        priceAtOrderTime: item.price,
        status: "pending",
        createdAt: new Date().toISOString()
      });
    }
    await batch.commit();

    return NextResponse.json({ message: "Order placed successfully", orderId: order.id });
  } catch (error) {
    console.error("Order error", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
