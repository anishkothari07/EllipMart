const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findMany({
  where: { status: 'ACTIVE', visibility: 'PUBLIC', deletedAt: null },
  take: 5,
  select: { id: true, name: true, status: true, visibility: true }
}).then(r => {
  console.log('Active PUBLIC products count:', r.length);
  console.log(JSON.stringify(r, null, 2));
  return p.$disconnect();
}).catch(e => {
  console.error('DB error:', e.message);
  return p.$disconnect();
});
