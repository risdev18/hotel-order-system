import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { tableId, hostUrl } = await req.json();

    if (!tableId || !hostUrl) {
      return NextResponse.json({ error: "Table ID and Host URL are required" }, { status: 400 });
    }

    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const orderUrl = `${hostUrl}/order/${table.tableNumber}`;
    const qrDataUrl = await QRCode.toDataURL(orderUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#b91c1c", // Dark red theme for dhaba
        light: "#ffffff",
      },
    });

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { qrCodeUrl: qrDataUrl },
    });

    return NextResponse.json({ table: updatedTable, qrCodeUrl: qrDataUrl, orderUrl });
  } catch (error) {
    console.error("Failed to generate QR code", error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
