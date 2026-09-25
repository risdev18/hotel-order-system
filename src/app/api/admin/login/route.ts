import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();

    const snapshot = await db.collection("restaurants").where("slug", "==", slug).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const restaurant = { id: doc.id, ...doc.data() } as any;

    if (restaurant.password !== password) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful",
      restaurantId: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
