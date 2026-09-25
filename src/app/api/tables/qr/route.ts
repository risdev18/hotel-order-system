import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function PUT(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tableId, qrCodeUrl } = await req.json();

    await db.collection("tables").doc(tableId).update({
      qrCodeUrl
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update QR code" }, { status: 500 });
  }
}
