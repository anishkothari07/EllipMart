import { prisma } from './src/index';

async function main() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE', visibility: 'PUBLIC', deletedAt: null },
    take: 5,
    select: { id: true, name: true, status: true, visibility: true }
  });
  console.log('Active PUBLIC products count:', products.length);
  console.log(JSON.stringify(products, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('DB error:', e.message);
  await prisma.$disconnect();
});
