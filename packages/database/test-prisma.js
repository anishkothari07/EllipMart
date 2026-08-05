const { PrismaClient } = require('@prisma/client');
console.log("Instantiating Prisma Client...");
try {
  const prisma = new PrismaClient();
  console.log("Success! Prisma Client instantiated.");
} catch (e) {
  console.error("Error instantiating Prisma Client:", e);
}
