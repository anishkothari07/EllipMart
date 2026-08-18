import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count FROM "User" WHERE role = 'MERCHANT'
  `;
  console.log('Users with MERCHANT role:', JSON.stringify(result));
  
  await prisma.$executeRaw`
    ALTER TYPE "Role" RENAME VALUE 'MERCHANT' TO 'SELLER'
  `;
  console.log('SUCCESS: Renamed Role enum MERCHANT -> SELLER');
  
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('ERROR:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
