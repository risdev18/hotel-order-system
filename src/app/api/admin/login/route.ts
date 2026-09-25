import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
