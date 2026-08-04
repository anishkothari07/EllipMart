import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../packages/database/src/index';

async function main() {
  console.log('Cleaning orphaned ProductPrice rows...');
  const deleted = await prisma.$executeRaw`
    DELETE FROM ProductPrice 
    WHERE productVariantId NOT IN (SELECT id FROM ProductVariant)
  `;
  console.log(`Deleted ${deleted} orphaned ProductPrice records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
