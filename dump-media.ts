import 'dotenv/config';
import { prisma } from './packages/database/src/index';
import fs from 'fs';

async function dump() {
  const media = await prisma.media.findMany({
    where: { storageProvider: 'CLOUDINARY' }
  });
  fs.writeFileSync('cloudinary-seed-media.json', JSON.stringify(media, null, 2));
  console.log(`Dumped ${media.length} media records.`);
}

dump().finally(() => prisma.$disconnect());
