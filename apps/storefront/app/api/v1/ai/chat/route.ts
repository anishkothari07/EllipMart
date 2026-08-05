export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';
import { AIService } from '@corecart/commerce';

export async function POST(req: NextRequest) {
  try {
    const { query, conversationId, contextPath, productId, categoryId } = await req.json();
    if (!query) {
      return NextResponse.json({ success: false, error: "query is required" }, { status: 400 });
    }

    let groundingContext = "";
    const sources: string[] = ["Database Catalog"];

    // 1. Fetch current active product specs/reviews if present
    if (productId) {
      const prod = await db.product.findUnique({
        where: { id: productId },
        include: { brand: true, category: true, specifications: { include: { spec: true } }, reviews: true }
      });
      if (prod) {
        sources.push("Product Specifications");
        if (prod.reviews && prod.reviews.length > 0) {
          sources.push("Customer Reviews");
        }
        groundingContext += `\n[CURRENT ACTIVE PRODUCT DETAILED SPECIFICATIONS]:
Name: ${prod.name}
ID: ${prod.id}
Description: ${prod.longDescription || prod.shortDescription || "N/A"}
Category: ${prod.category?.name || "N/A"}
Brand: ${prod.brand?.name || "N/A"}
Reviews Average Rating: ${prod.ratingAverage}/5 (Count: ${prod.reviewCount})
User Reviews List:
${prod.reviews.map((r, i) => `${i + 1}. Rating: ${r.rating}, Review: "${r.comment}"`).join("\n")}
Technical Specs:
${prod.specifications.map(s => `- ${s.spec.name}: ${s.value}`).join("\n")}
`;
      }
    }

    // 2. Fetch current category and its products
    if (categoryId) {
      const cat = await db.category.findUnique({
        where: { id: categoryId },
        include: { products: { take: 10 } }
      });
      if (cat) {
        sources.push("Category Products");
        groundingContext += `\n[PRODUCTS IN CURRENT CATEGORY ${cat.name}]:
${cat.products.map(p => `- ID: ${p.id}, Name: ${p.name}, Specs: ${p.shortDescription || p.longDescription || "N/A"}`).join("\n")}
`;
      }
    }

    // 3. Fetch orders context if requested
    if (query.toLowerCase().includes("order") || contextPath?.includes("orders")) {
      sources.push("Orders Database");
      const orders = await db.order.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { payment: true }
      });
      if (orders.length > 0) {
        groundingContext += `\n[USER RECENT ORDER HISTORY]:
${orders.map(o => `- Order #${o.orderNumber} (ID: ${o.id}): Status is ${o.status}. Paid status: ${o.payment?.status || "PENDING"}. Total Grand Amount: $${o.grandTotal}`).join("\n")}
`;
      } else {
        groundingContext += `\n[USER RECENT ORDER HISTORY]: No customer orders found in the database.`;
      }
    }

    // 4. Fallback search catalog matching query words
    const keywords = query.split(" ").filter((w: string) => w.length > 3);
    const searchConditions = keywords.map((k: string) => ({ name: { contains: k } }));
    if (searchConditions.length > 0) {
      const searchProducts = await db.product.findMany({
        where: { OR: searchConditions },
        take: 5
      });
      if (searchProducts.length > 0) {
        groundingContext += `\n[MATCHING PRODUCTS IN CATALOG]:
${searchProducts.map(p => `- ID: ${p.id}, Name: ${p.name}, Description: ${p.longDescription || "N/A"}`).join("\n")}
`;
      }
    }

    // Instructions to force JSON format containing message, productIds, sources, and suggestions
    const jsonInstruction = `
You are SmartGO AI Copilot, an enterprise-grade shopping assistant.
You must return a valid JSON object matching this schema:
{
  "message": "Write a helpful conversational response to the customer. Ground your answer strictly in the provided database context for catalog queries, comparison requests, or order checks. If the query requires store information that doesn't exist, respond 'I couldn't find that information in this store.' For general knowledge, answer naturally using your general knowledge.",
  "productIds": ["array of exact database product IDs recommended or referenced from the context. Only use IDs present in the context. Leave empty if none are recommended"],
  "sources": ["array of sources used, e.g. 'Product Specifications', 'Customer Reviews', 'Orders Database', 'General Knowledge'"],
  "suggestions": ["3-4 follow-up dynamic contextual options"]
}
Return only the raw JSON.
`;

    // Call dynamic AIService. If Gemini key is set, it calls GeminiProvider; else MockProvider
    const responseText = await AIService.generateText(
      "CHAT_ASSISTANT",
      query,
      groundingContext.trim(),
      { json: true, systemInstruction: jsonInstruction }
    );

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Graceful parsing fallback (e.g., if Mock provider returned simple text)
      parsed = {
        message: responseText,
        productIds: [],
        sources: ["Mock Database Catalog"],
        suggestions: [
          "Compare with another model",
          "What are the return policies?",
          "Track my recent order"
        ]
      };
    }

    // Conversation thread database logging
    let convId = conversationId;
    if (!convId) {
      const conv = await db.aIConversation.create({
        data: { title: query.slice(0, 50) }
      });
      convId = conv.id;
    }

    await db.aIMessage.create({
      data: {
        conversationId: convId,
        role: "user",
        content: query,
      }
    });

    await db.aIMessage.create({
      data: {
        conversationId: convId,
        role: "model",
        content: parsed.message || responseText,
      }
    });

    // Resolve product objects if productIds are suggested
    let recommendedProducts: any[] = [];
    if (parsed.productIds && parsed.productIds.length > 0) {
      recommendedProducts = await db.product.findMany({
        where: { id: { in: parsed.productIds } }
      });
    }

    return NextResponse.json({
      success: true,
      reply: parsed.message || responseText,
      conversationId: convId,
      sources: parsed.sources || sources,
      suggestions: parsed.suggestions || [],
      products: recommendedProducts
    });
  } catch (error: any) {
    console.error("[ChatAPI Error]:", error);
    return NextResponse.json({ 
      success: false, 
      error: "SmartGO Assistant is temporarily unavailable. Please try again." 
    }, { status: 500 });
  }
}

