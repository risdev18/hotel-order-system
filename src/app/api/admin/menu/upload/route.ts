import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();

// Ensure the user sets GEMINI_API_KEY in their .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export async function POST(req: NextRequest) {
  let restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl?.searchParams?.get("restaurantId");
  if (!restaurantId) return NextResponse.json({error: "Missing restaurantId"}, {status:400});

  try {
    const formData = await req.formData();
    const file = formData.get("menuImage") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const prompt = `
      Extract the menu items from this restaurant menu image.
      Return the data strictly as a JSON array of objects.
      Each object should have:
      - "name": String, the name of the dish
      - "price": Number, the price of the dish
      - "categoryName": String, the section it belongs to (e.g. Starters, Main Course, Breads, Beverages, etc.)
      - "vegFlag": Boolean, true if it's vegetarian, false if it's non-vegetarian (meat/egg/chicken/mutton/fish)
      - "description": String, short description of the dish if present, else empty string.
      
      Output ONLY valid JSON.
    `;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy") {
      return NextResponse.json({ error: "Please add your GEMINI_API_KEY to the .env file in the hotel directory to enable Real AI parsing." }, { status: 400 });
    }
    
    let response = null;
    let retries = 3;
    let delay = 15000;
    
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            { role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64Data } }] }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });
        break; // Success, exit loop
      } catch (err: any) {
        const errorMsg = err.message || "";
        // Check for 503 Overload or 429 Quota Exceeded
        if ((errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) && retries > 1) {
          console.log(`API limit reached. Waiting for quota to reset in ${delay/1000}s...`);
          await new Promise(r => setTimeout(r, delay));
          retries--;
          delay *= 1.5; // Exponential backoff (e.g. 15s -> 22s -> 33s)
        } else {
          throw err;
        }
      }
    }

    if (!response || !response.text) {
      throw new Error("No response from AI after retries");
    }
    let parsedItems = JSON.parse(response.text);

    // Save to database
    // Group into categories
    let insertedCount = 0;
    for (const item of parsedItems) {
      if (!item.name || !item.price || !item.categoryName) continue;
      
      // Find or create category
      let category = await prisma.menuCategory.findFirst({ where: { name: item.categoryName, restaurantId } });
      if (!category) {
        const lastCat = await prisma.menuCategory.findFirst({ where: { restaurantId }, orderBy: { sortOrder: 'desc' } });
        category = await prisma.menuCategory.create({
          data: { name: item.categoryName, sortOrder: (lastCat?.sortOrder || 0) + 1, restaurantId }
        });
      }

      // Create item
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: Number(item.price),
          categoryId: category.id,
          vegFlag: item.vegFlag !== undefined ? item.vegFlag : true,
          description: item.description || "",
          imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(item.name.substring(0, 10))}`
        }
      });
      insertedCount++;
    }

    return NextResponse.json({ message: "Menu processed successfully", itemsInserted: insertedCount, parsedData: parsedItems });
  } catch (error: any) {
    console.error("AI Upload error", error);
    return NextResponse.json({ error: error.message || "Failed to process menu image" }, { status: 500 });
  }
}
