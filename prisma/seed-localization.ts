import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = process.env.DATABASE_URL;
const adapter = new PrismaMariaDb(databaseUrl.replace("mysql://", "mariadb://"));
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding localization data...");

  // Delete existing records to allow re-seeding without duplicate keys
  try {
    await prisma.pincode.deleteMany();
    await prisma.city.deleteMany();
    await prisma.district.deleteMany();
    await prisma.state.deleteMany();
    await prisma.eMIPlan.deleteMany();
    await prisma.bankOffer.deleteMany();
    await prisma.festivalCampaign.deleteMany();
  } catch (e) {
    console.warn("Table cleanup warnings:", e);
  }

  // 1. Create Country
  const country = await prisma.country.upsert({
    where: { code: "IN" },
    update: {},
    create: {
      code: "IN",
      name: "India",
      currency: "INR",
      currencySymbol: "₹",
      locale: "en-IN",
      phonePrefix: "+91",
      phoneLength: 10,
      isActive: true,
    },
  });
  console.log("Country created/verified: ", country.name);

  // 2. Create States
  const karnataka = await prisma.state.create({
    data: {
      countryCode: "IN",
      code: "KA",
      name: "Karnataka",
    },
  });

  const delhi = await prisma.state.create({
    data: {
      countryCode: "IN",
      code: "DL",
      name: "Delhi",
    },
  });

  // 3. Create Districts
  const bengaluruDistrict = await prisma.district.create({
    data: {
      stateId: karnataka.id,
      name: "Bengaluru",
    },
  });

  const newDelhiDistrict = await prisma.district.create({
    data: {
      stateId: delhi.id,
      name: "New Delhi",
    },
  });

  // 4. Create Cities
  const bengaluruCity = await prisma.city.create({
    data: {
      districtId: bengaluruDistrict.id,
      name: "Bengaluru",
    },
  });

  const newDelhiCity = await prisma.city.create({
    data: {
      districtId: newDelhiDistrict.id,
      name: "New Delhi",
    },
  });

  // 5. Create Pincodes
  await prisma.pincode.create({
    data: {
      code: "560001",
      cityId: bengaluruCity.id,
      stateId: karnataka.id,
      isServiced: true,
      isCOD: true,
      isExpress: true,
      estDaysMin: 1,
      estDaysMax: 2,
      shippingCharge: 0.0,
    },
  });

  await prisma.pincode.create({
    data: {
      code: "110001",
      cityId: newDelhiCity.id,
      stateId: delhi.id,
      isServiced: true,
      isCOD: true,
      isExpress: true,
      estDaysMin: 1,
      estDaysMax: 3,
      shippingCharge: 49.0,
    },
  });

  // 6. Create GST Rules
  await prisma.gSTRule.upsert({
    where: { hsnCode: "8471" },
    update: {},
    create: {
      hsnCode: "8471",
      cgst: 9.0,
      sgst: 9.0,
      igst: 18.0,
      utgst: 0.0,
    },
  });

  // 7. Create Bank Offers & EMI Plans
  const bankOffer = await prisma.bankOffer.create({
    data: {
      countryCode: "IN",
      bankName: "HDFC",
      cardType: "CREDIT",
      minTxnAmount: 5000,
      discountType: "PERCENT",
      discountValue: 10,
      maxDiscount: 1500,
    },
  });

  await prisma.eMIPlan.create({
    data: {
      bankOfferId: bankOffer.id,
      months: 6,
      interestRate: 0.0,
      isNoCost: true,
      minAmount: 3000,
    },
  });

  // 8. Create Festival Campaign
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 864e5);
  await prisma.festivalCampaign.create({
    data: {
      code: "DIWALI_2026",
      name: "Great Diwali Sale",
      startDate: now,
      endDate: nextWeek,
      themeJson: JSON.stringify({
        primaryColor: "#FF5733",
        bannerText: "Happy Diwali! Extra 10% Discount on all orders.",
      }),
    },
  });

  // 9. Regional Configuration
  await prisma.regionalConfiguration.upsert({
    where: { countryCode: "IN" },
    update: {},
    create: {
      countryCode: "IN",
      defaultLanguage: "en",
      taxType: "GST",
      addressFieldsJson: JSON.stringify({
        pincode: { required: true, pattern: "^\\d{6}$" },
        phone: { required: true, pattern: "^\\d{10}$" },
      }),
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
