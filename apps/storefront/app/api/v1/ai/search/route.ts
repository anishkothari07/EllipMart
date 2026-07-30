import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const keywords = query.split(" ").filter((w: string) => w.length > 2);
    const conditions = keywords.map((k: string) => ({ name: { contains: k } }));

    const products = await db.product.findMany({
      where: conditions.length > 0 ? { OR: conditions } : {},
      take: 10,
      include: {
        category: true,
        brand: true,
      }
    });

    // Extract categories & brands
    const categoriesMap = new Map();
    const brandsMap = new Map();

    products.forEach((p) => {
      if (p.category) {
        categoriesMap.set(p.category.id, p.category.name);
      }
      if (p.brand) {
        brandsMap.set(p.brand.id, p.brand.name);
      }
    });

    const filters = {
      categories: Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name })),
      brands: Array.from(brandsMap.entries()).map(([id, name]) => ({ id, name })),
    };

    const suggestedCategories = filters.categories.slice(0, 3);
    const relatedSearches = keywords.length > 0 
      ? [
          `${query} reviews`,
          `best ${keywords[0]} deals`,
          `${keywords[0]} comparison`
        ]
      : ["best sellers", "latest releases"];

    return NextResponse.json({
      success: true,
      results: products,
      filters,
      suggestedCategories,
      relatedSearches,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
