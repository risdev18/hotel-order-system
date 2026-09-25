import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Groq from "groq-sdk";

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("menuImage") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const prompt = `
      Extract the menu items from this restaurant menu image.
      Return the data strictly as a JSON array of objects, with no markdown formatting, no backticks, just the raw JSON array starting with [ and ending with ].
      Each object should have:
      - "name": String, the name of the dish
      - "price": Number, the price of the dish
      - "categoryName": String, the section it belongs to (e.g. Starters, Main Course, Breads, Beverages, etc.)
      - "vegFlag": Boolean, true if it's vegetarian, false if it's non-vegetarian (meat/egg/chicken/mutton/fish)
      - "description": String, short description of the dish if present, else empty string.
    `;

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "dummy") {
      return NextResponse.json({ error: "Please add your GROQ_API_KEY to the .env file." }, { status: 400 });
    }
    
    let response = null;
    let retries = 3;
    let delay = 2000;
    
    while (retries > 0) {
      try {
        response = await groq.chat.completions.create({
          model: "llama-3.2-90b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
              ]
            }
          ],
          temperature: 0.1,
        });
        break; // Success, exit loop
      } catch (err: any) {
        const errorMsg = err.message || "";
        if ((errorMsg.includes("429") || errorMsg.includes("503")) && retries > 1) {
          console.log(`Groq API limit reached. Retrying in ${delay/1000}s...`);
          await new Promise(r => setTimeout(r, delay));
          retries--;
          delay *= 1.5;
        } else {
          throw err;
        }
      }
    }

    if (!response || !response.choices[0]?.message?.content) {
      throw new Error("No response from Groq AI");
    }
    
    let rawContent = response.choices[0].message.content.trim();
    // Clean up potential markdown code blocks (e.g. ```json ... ```)
    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    let parsedItems = JSON.parse(rawContent);

    // Save to database
    // Group into categories
    let insertedCount = 0;
    for (const item of parsedItems) {
      if (!item.name || !item.price || !item.categoryName) continue;
      
      // Find or create category
      let category = await prisma.menuCategory.findFirst({ where: { name: item.categoryName } });
      if (!category) {
        const lastCat = await prisma.menuCategory.findFirst({ orderBy: { sortOrder: 'desc' } });
        category = await prisma.menuCategory.create({
          data: { name: item.categoryName, sortOrder: (lastCat?.sortOrder || 0) + 1 }
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
