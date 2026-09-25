import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { name: "The Royal Dhaba", tableCount: 30 }
      });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { name, logoUrl, tableCount } = await req.json();
    let settings = await prisma.storeSettings.findFirst();
    
    if (settings) {
      settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: { name, logoUrl, tableCount: Number(tableCount) }
      });
    } else {
      settings = await prisma.storeSettings.create({
        data: { name, logoUrl, tableCount: Number(tableCount) }
      });
    }

    // Generate missing tables if the count was increased
    const currentTablesCount = await prisma.table.count();
    if (Number(tableCount) > currentTablesCount) {
      for (let i = currentTablesCount + 1; i <= Number(tableCount); i++) {
        const tNum = `T${i.toString().padStart(2, '0')}`;
        await prisma.table.upsert({
          where: { tableNumber: tNum },
          update: {},
          create: { tableNumber: tNum }
        });
      }
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
