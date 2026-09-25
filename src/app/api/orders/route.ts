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
    } else {
      // If the order was already preparing or served, we need to push it back to the kitchen!
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "placed" }
      });
      order.status = "placed";
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
