import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // 1. Create Tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const tableNumber = `T${i.toString().padStart(2, "0")}`;
      tables.push(
        prisma.table.upsert({
          where: { tableNumber },
          update: {},
          create: { tableNumber },
        })
      );
    }
    await Promise.all(tables);

    // 2. Create Menu Categories
    const categoriesData = [
      { name: "Starters", sortOrder: 1 },
      { name: "Main Course (Veg)", sortOrder: 2 },
      { name: "Main Course (Non-Veg)", sortOrder: 3 },
      { name: "Breads", sortOrder: 4 },
      { name: "Rice & Biryani", sortOrder: 5 },
      { name: "Beverages", sortOrder: 6 },
    ];

    const categories = [];
    for (const cat of categoriesData) {
      categories.push(
        prisma.menuCategory.create({
          data: cat,
        })
      );
    }
    // Delete existing to avoid duplicates in bootstrap (simple approach)
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    
    const createdCats = await Promise.all(
      categoriesData.map((cat) => prisma.menuCategory.create({ data: cat }))
    );

    // 3. Create Menu Items
    const itemsData = [
      { name: "Paneer Tikka", price: 250, categoryName: "Starters", vegFlag: true, description: "Charcoal grilled paneer cubes" },
      { name: "Chicken Tikka", price: 320, categoryName: "Starters", vegFlag: false, description: "Spicy grilled chicken chunks" },
      { name: "Masala Papad", price: 40, categoryName: "Starters", vegFlag: true, description: "Roasted papad topped with onions and tomatoes" },
      { name: "Paneer Butter Masala", price: 280, categoryName: "Main Course (Veg)", vegFlag: true, description: "Paneer in rich tomato and butter gravy" },
      { name: "Dal Makhani", price: 220, categoryName: "Main Course (Veg)", vegFlag: true, description: "Slow-cooked black lentils" },
      { name: "Butter Chicken", price: 350, categoryName: "Main Course (Non-Veg)", vegFlag: false, description: "Classic chicken in rich buttery gravy" },
      { name: "Mutton Rogan Josh", price: 450, categoryName: "Main Course (Non-Veg)", vegFlag: false, description: "Kashmiri style mutton curry" },
      { name: "Tandoori Roti", price: 25, categoryName: "Breads", vegFlag: true, description: "Whole wheat bread baked in tandoor" },
      { name: "Garlic Naan", price: 60, categoryName: "Breads", vegFlag: true, description: "Flour bread topped with garlic and butter" },
      { name: "Jeera Rice", price: 150, categoryName: "Rice & Biryani", vegFlag: true, description: "Basmati rice tossed with cumin seeds" },
      { name: "Chicken Biryani", price: 380, categoryName: "Rice & Biryani", vegFlag: false, description: "Aromatic basmati rice with chicken and spices" },
      { name: "Sweet Lassi", price: 80, categoryName: "Beverages", vegFlag: true, description: "Thick sweet yogurt drink" },
      { name: "Masala Chaas", price: 60, categoryName: "Beverages", vegFlag: true, description: "Spiced buttermilk" },
    ];

    const items = itemsData.map((item) => {
      const category = createdCats.find((c) => c.name === item.categoryName);
      return prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          vegFlag: item.vegFlag,
          description: item.description,
          categoryId: category!.id,
          imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(item.name)}`
        },
      });
    });

    await Promise.all(items);

    return NextResponse.json({ message: "Bootstrap successful!" });
  } catch (error) {
    console.error("Bootstrap error:", error);
    return NextResponse.json({ error: "Failed to bootstrap" }, { status: 500 });
  }
}
