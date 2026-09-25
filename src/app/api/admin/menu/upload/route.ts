import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/genai";
import { db } from "@/lib/firebase-admin";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("menuImage") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    const prompt = `
      Extract the menu items from this image. 
      Return a pure JSON array of objects.
      Each object should have:
      - categoryName (string, e.g. "Starters", "Mains")
      - name (string, the name of the dish)
      - price (number, just the number)
      - vegFlag (boolean, true if vegetarian, false if non-veg. Infer if possible, default to true)
      
      CRITICAL: Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json. Just the raw array starting with [ and ending with ].
    `;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      }
    ]);

    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const items = JSON.parse(text);
    
    if (!Array.isArray(items)) {
      throw new Error("AI did not return an array");
    }

    const batch = db.batch();
    const categoriesMap = new Map<string, string>();
    const categorySnapshot = await db.collection("menuCategories").where("restaurantId", "==", restaurantId).get();
    
    categorySnapshot.docs.forEach(doc => {
      categoriesMap.set(doc.data().name.toLowerCase(), doc.id);
    });

    for (const item of items) {
      if (!item.name || !item.price || !item.categoryName) continue;
      const catKey = item.categoryName.toLowerCase();
      
      let categoryId = categoriesMap.get(catKey);
      if (!categoryId) {
        const catRef = db.collection("menuCategories").doc();
        batch.set(catRef, {
          name: item.categoryName,
          restaurantId,
          sortOrder: 0
        });
        categoryId = catRef.id;
        categoriesMap.set(catKey, categoryId);
      }

      const itemRef = db.collection("menuItems").doc();
      batch.set(itemRef, {
        name: item.name,
        price: parseFloat(item.price.toString()),
        vegFlag: item.vegFlag ?? true,
        categoryId,
        isAvailable: true,
        restaurantId
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true, itemsInserted: items.length });
  } catch (error: any) {
    console.error("AI Upload Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
