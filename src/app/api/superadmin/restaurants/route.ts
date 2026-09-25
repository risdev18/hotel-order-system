import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: { tables: true, orders: true }
        }
      }
    });
    return NextResponse.json({ restaurants });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Check if slug exists
    const existing = await prisma.restaurant.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "URL slug is already taken." }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        slug: data.slug,
        password: data.password
      }
    });

    return NextResponse.json({ restaurant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
