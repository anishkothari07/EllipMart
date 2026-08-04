import "dotenv/config";
import { ensureDefaultPaymentMethods } from "./lib/modules/payment/payment-seed";
import { prisma as db } from "./lib/prisma/client";

async function test() {
  console.log("Seeding default methods...");
  await ensureDefaultPaymentMethods();
  
  console.log("Querying payment methods...");
  const methods = await db.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: { rules: true }
  });

  console.log("Fetched Methods Count:", methods.length);
  console.log(JSON.stringify(methods, null, 2));
}

test()
  .catch(console.error)
  .finally(() => db.$disconnect());
