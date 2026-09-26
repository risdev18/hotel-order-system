import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tableId, hostUrl } = await req.json();

    // Fetch restaurant slug
    const restDoc = await db.collection("restaurants").doc(restaurantId).get();
    if (!restDoc.exists) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    const slug = restDoc.data()?.slug;

    const orderUrl = `${hostUrl}/order/${slug}/${tableId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderUrl)}`;

    await db.collection("tables").doc(tableId).update({
      qrCodeUrl
    });

    return NextResponse.json({ success: true, qrCodeUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update QR code" }, { status: 500 });
  }
}
