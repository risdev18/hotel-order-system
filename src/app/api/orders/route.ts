import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { tableId, items } = await req.json();

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // Check if there is an active unpaid order for this table to append to, or create new.
    let order = await prisma.order.findFirst({
      where: {
        tableId,
        status: { notIn: ["paid"] },
        paymentStatus: "unpaid"
      }
    });

    if (!order) {
      order = await prisma.order.create({
        data: {
          tableId,
          status: "placed"
        }
      });
    }

    // Create Order Items
    const orderItemsData = items.map((item: any) => ({
      orderId: order!.id,
      menuItemId: item.id,
      quantity: item.quantity,
      priceAtOrderTime: item.price
    }));

    await prisma.orderItem.createMany({
      data: orderItemsData
    });

    return NextResponse.json({ message: "Order placed successfully", orderId: order.id });
  } catch (error) {
    console.error("Order error", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
