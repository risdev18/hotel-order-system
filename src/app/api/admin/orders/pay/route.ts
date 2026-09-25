import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl?.searchParams?.get("restaurantId");
  // Also allow body to have restaurantId

  try {
    const { orderId, method } = await req.json();

    if (!orderId || !method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the order to calculate totals
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const subtotal = order.items.reduce((total, item) => total + (item.quantity * item.priceAtOrderTime), 0);
    const gst = subtotal * 0.05;
    const total = subtotal + gst;

    // Create the Bill record
    await prisma.bill.create({
      data: {
        orderId,
        subtotal,
        tax: gst,
        serviceCharge: 0,
        total,
        paymentMethod: method,
        paidAt: new Date()
      }
    });

    // Update the Order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        paymentStatus: method === "online" ? "paid_online" : "paid_counter"
      }
    });

    return NextResponse.json({ message: "Payment processed successfully" });
  } catch (error) {
    console.error("Payment error", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
