import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({error: "Missing restaurantId"}, {status:400});

  try {
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        // Fetch active orders (not fully paid/closed, or closed today if we wanted history, but for live dashboard just active ones)
        status: { notIn: ["paid"] }
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Oldest first for kitchen
      }
    });
    
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  let restaurantId = req.headers.get("x-restaurant-id");

  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
