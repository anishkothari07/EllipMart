const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
