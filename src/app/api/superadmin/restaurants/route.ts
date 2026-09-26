import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await db.collection("restaurants").get();
    const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ restaurants });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, tableCount, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const finalTableCount = tableCount ? parseInt(tableCount) : 10;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Check if slug exists
    const existing = await db.collection("restaurants").where("slug", "==", slug).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "Restaurant already exists" }, { status: 400 });
    }

    const docRef = await db.collection("restaurants").add({
      name,
      slug,
      tableCount: finalTableCount,
      password,
      createdAt: new Date().toISOString()
    });

    // Auto-provision tables with QR codes
    const batch = db.batch();
    // Default host URL - in production, this should ideally be passed in or read from env.
    const hostUrl = req.headers.get("origin") || "http://localhost:3000";

    for (let i = 1; i <= finalTableCount; i++) {
      const tableRef = db.collection("tables").doc();
      const tableNumberStr = `T${i.toString().padStart(2, '0')}`;
      
      const orderUrl = `${hostUrl}/order/${slug}/${tableNumberStr}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderUrl)}`;

      batch.set(tableRef, {
        restaurantId: docRef.id,
        tableNumber: tableNumberStr,
        status: "free",
        qrCodeUrl,
        createdAt: new Date().toISOString()
      });
    }
    await batch.commit();

    return NextResponse.json({ message: "Restaurant created successfully", id: docRef.id, slug });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "DB Error: " + (error.message || "Unknown") }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing restaurant ID" }, { status: 400 });
    }
    
    await db.collection("restaurants").doc(id).delete();
    
    return NextResponse.json({ message: "Restaurant deleted successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete restaurant" }, { status: 500 });
  }
}
