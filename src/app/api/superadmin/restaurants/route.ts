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

    return NextResponse.json({ message: "Restaurant created successfully", id: docRef.id, slug });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "DB Error: " + (error.message || "Unknown") }, { status: 500 });
  }
}
