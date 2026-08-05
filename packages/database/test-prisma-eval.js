const requireFn = eval('req' + 'uire');
const prismaPackagePath = requireFn.resolve('@prisma/client/package.json');
const path = requireFn('path');
const generatedClientPath = path.join(path.dirname(prismaPackagePath), '../../.prisma/client/index.js');
console.log('--- REQUIRING PRISMA FROM ---', generatedClientPath);
const { PrismaClient } = requireFn(generatedClientPath);
try {
  const prisma = new PrismaClient({ log: ['error'] });
  console.log("Success! Prisma Client instantiated with eval bypass.");
} catch (e) {
  console.error("Error instantiating Prisma Client:", e);
}
