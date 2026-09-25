import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

  try {
    const { orderId, method } = await req.json();

    const orderRef = db.collection("orders").doc(orderId);
    await orderRef.update({
      paymentStatus: "paid",
      status: "paid",
      paymentMethod: method,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark paid" }, { status: 500 });
  }
}
