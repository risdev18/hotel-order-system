import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

  try {
    const { count, hostUrl } = await req.json();
    if (!count || count <= 0 || !hostUrl) return NextResponse.json({ error: "Invalid count or missing hostUrl" }, { status: 400 });

    // Fetch restaurant slug
    const restDoc = await db.collection("restaurants").doc(restaurantId).get();
    if (!restDoc.exists) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    const slug = restDoc.data()?.slug;

    // Find highest existing table number
    const existing = await db.collection("tables")
      .where("restaurantId", "==", restaurantId)
      .get();
      
    let maxTableNum = 0;
    existing.docs.forEach(doc => {
      const tNumStr = doc.data().tableNumber; // e.g. "T01" or "1"
      const numMatch = tNumStr.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0]);
        if (num > maxTableNum) maxTableNum = num;
      }
    });

    const batch = db.batch();
    for (let i = 1; i <= count; i++) {
      const nextNum = maxTableNum + i;
      const tableRef = db.collection("tables").doc();
      const tableNumberStr = `T${nextNum.toString().padStart(2, '0')}`;
      
      const orderUrl = `${hostUrl}/order/${slug}/${tableRef.id}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderUrl)}`;

      batch.set(tableRef, {
        restaurantId,
        tableNumber: tableNumberStr,
        status: "free",
        qrCodeUrl,
        createdAt: new Date().toISOString()
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true, message: `Created ${count} tables` });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tables" }, { status: 500 });
  }
}
