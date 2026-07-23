import "dotenv/config";
import { prisma as db } from "../lib/prisma/client";
import { ensureDefaultPaymentMethods } from "../lib/modules/payment/payment-seed";

async function verify() {
  console.log("=== STEP 1: Running Seed ===");
  await ensureDefaultPaymentMethods();

  console.log("\n=== STEP 2: Database Direct Query (SELECT * FROM PaymentMethod) ===");
  const queryDesc = "db.paymentMethod.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' }, include: { providers: { include: { provider: true } } } })";
  console.log(`Prisma Query: ${queryDesc}`);

  const rawRows = await db.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      providers: {
        include: {
          provider: true
        }
      },
      rules: true
    }
  });

  console.log(`Rows returned: ${rawRows.length}`);
  console.log("Raw Database Data:");
  console.log(JSON.stringify(rawRows, null, 2));

  console.log("\n=== STEP 3: Verification Check ===");
  const codes = rawRows.map(r => r.code);
  console.log("Returned Method Codes:", codes);

  if (rawRows.length === 5 && codes.includes("UPI") && codes.includes("CARD") && codes.includes("NETBANKING") && codes.includes("WALLET") && codes.includes("COD")) {
    console.log("✅ VERIFICATION SUCCESSFUL: Exactly 5 payment methods seeded and verified.");
  } else {
    console.error("❌ VERIFICATION FAILED: Expected 5 payment methods.");
  }
}

verify()
  .catch(console.error)
  .finally(() => db.$disconnect());
