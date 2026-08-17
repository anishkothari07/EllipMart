export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@corecart/database';
import { ensureDefaultPaymentMethods } from '@corecart/commerce';

export async function GET(req: NextRequest) {
  try {
    await ensureDefaultPaymentMethods();
    
    const { searchParams } = new URL(req.url);
    const cartTotal = Number(searchParams.get("cartTotal")) || 0;
    
    // Fetch all active payment methods ordered by displayOrder, filtering for only COD and UPI
    const methods = await db.paymentMethod.findMany({
      where: { 
        isActive: true,
        code: { in: ['COD', 'UPI'] }
      },
      orderBy: { displayOrder: 'asc' },
      include: {
        rules: true,
      }
    });

    const evaluatedMethods = methods.map(method => {
      let isAvailable = true;
      let reason: string | undefined = undefined;

      // Evaluate Rules
      if (method.rules && method.rules.length > 0) {
        for (const rule of method.rules) {
          if (rule.minAmount && cartTotal < Number(rule.minAmount)) {
            isAvailable = false;
            reason = `Minimum order amount for ${method.name} is ${rule.minAmount}`;
            break; // Stop evaluating rules for this method
          }
          if (rule.maxAmount && cartTotal > Number(rule.maxAmount)) {
            isAvailable = false;
            reason = `Maximum order amount for ${method.name} is ${rule.maxAmount}`;
            break;
          }
        }
      }

      return {
        id: method.id,
        code: method.code,
        name: method.name,
        type: method.type,
        description: method.description,
        isAvailable,
        reason,
      };
    });

    return NextResponse.json({ success: true, data: evaluatedMethods });
  } catch (error: any) {
    console.error("Failed to fetch payment methods:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

