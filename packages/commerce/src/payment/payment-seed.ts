import { prisma as db } from '@corecart/database';
import { PaymentMethodType } from "@prisma/client";

export async function ensureDefaultPaymentMethods() {
  try {
    const existingCount = await db.paymentMethod.count();
    console.log(`[Seed Check] PaymentMethod table current count: ${existingCount}`);
    
    if (existingCount >= 5) {
      return;
    }

    console.log("[Seeding] Populating Enterprise Payment Methods...");

    // 1. Providers (RAZORPAY, INTERNAL, MOCK)
    const razorpayProvider = await db.paymentProvider.upsert({
      where: { code: "RAZORPAY" },
      update: { name: "Razorpay", isActive: true },
      create: {
        code: "RAZORPAY",
        name: "Razorpay",
        isActive: true,
      },
    });

    const internalProvider = await db.paymentProvider.upsert({
      where: { code: "INTERNAL" },
      update: { name: "Internal COD Provider", isActive: true },
      create: {
        code: "INTERNAL",
        name: "Internal COD Provider",
        isActive: true,
      },
    });

    await db.paymentProvider.upsert({
      where: { code: "MOCK" },
      update: { name: "Mock Provider", isActive: true },
      create: {
        code: "MOCK",
        name: "Mock Provider",
        isActive: true,
      },
    });

    // Also support "COD" as alias provider for backward compatibility
    await db.paymentProvider.upsert({
      where: { code: "COD" },
      update: { name: "COD Provider", isActive: true },
      create: {
        code: "COD",
        name: "COD Provider",
        isActive: true,
      },
    });

    // 2. Methods
    const methodsData = [
      {
        code: "UPI",
        name: "UPI",
        type: PaymentMethodType.UPI,
        description: "Google Pay, PhonePe, Paytm, BHIM or any UPI ID",
        displayOrder: 1,
        providerId: razorpayProvider.id,
      },
      {
        code: "CARD",
        name: "Cards",
        type: PaymentMethodType.CARD,
        description: "Credit / Debit Card (Visa, Mastercard, RuPay, Amex)",
        displayOrder: 2,
        providerId: razorpayProvider.id,
      },
      {
        code: "NETBANKING",
        name: "Net Banking",
        type: PaymentMethodType.NETBANKING,
        description: "All major Indian banks (SBI, HDFC, ICICI, Axis, Kotak)",
        displayOrder: 3,
        providerId: razorpayProvider.id,
      },
      {
        code: "WALLET",
        name: "Wallets",
        type: PaymentMethodType.WALLET,
        description: "Paytm, Amazon Pay, PhonePe, Mobikwik",
        displayOrder: 4,
        providerId: razorpayProvider.id,
      },
      {
        code: "COD",
        name: "Cash on Delivery",
        type: PaymentMethodType.COD,
        description: "Pay with cash when your order is delivered to your doorstep",
        displayOrder: 5,
        providerId: internalProvider.id,
      },
    ];

    for (const m of methodsData) {
      const createdMethod = await db.paymentMethod.upsert({
        where: { code: m.code },
        update: {
          name: m.name,
          type: m.type,
          description: m.description,
          displayOrder: m.displayOrder,
          isActive: true,
        },
        create: {
          code: m.code,
          name: m.name,
          type: m.type,
          description: m.description,
          displayOrder: m.displayOrder,
          isActive: true,
        },
      });

      // Map method to provider
      await db.paymentMethodProvider.upsert({
        where: {
          paymentMethodId_providerId: {
            paymentMethodId: createdMethod.id,
            providerId: m.providerId,
          },
        },
        update: {
          priority: 10,
          enabled: true,
        },
        create: {
          paymentMethodId: createdMethod.id,
          providerId: m.providerId,
          priority: 10,
          enabled: true,
        },
      });

      // Add COD limit rule (max 25000)
      if (m.code === "COD") {
        const existingRules = await db.paymentMethodRule.findMany({
          where: { paymentMethodId: createdMethod.id },
        });
        if (existingRules.length === 0) {
          await db.paymentMethodRule.create({
            data: {
              paymentMethodId: createdMethod.id,
              maxAmount: 25000,
            },
          });
        }
      }
    }

    const finalCount = await db.paymentMethod.count();
    console.log(`[Seed Success] PaymentMethod table count is now: ${finalCount}`);
  } catch (err) {
    console.error("Error seeding default payment methods:", err);
  }
}
