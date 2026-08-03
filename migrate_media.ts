import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from './packages/database/src/index';
import { CloudinaryStorageProvider } from './packages/commerce/src/media/storage/cloudinary.storage';

async function main() {
  console.log("Starting Media Migration...");
  
  const cloudinary = new CloudinaryStorageProvider();

  // Find all media that doesn't use cloudinary
  const localMedia = await prisma.media.findMany({
    where: {
      storageProvider: { not: 'CLOUDINARY' }
    }
  });

  console.log(`Found ${localMedia.length} local media records to migrate.`);

  let successCount = 0;
  for (const media of localMedia) {
    console.log(`Migrating ${media.id} (${media.filename})...`);
    
    // Try to find the local file
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'images', media.filename),
      path.join(process.cwd(), 'public', 'uploads', media.filename)
    ];

    let fileBuffer: Buffer | null = null;
    let actualPath = '';

    for (const p of possiblePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        fileBuffer = fs.readFileSync(p);
        actualPath = p;
        break;
      }
    }

    if (!fileBuffer) {
      console.warn(`⚠️ Could not find local file for ${media.filename}. Skipping upload, but updating provider.`);
      // If we can't find it locally (maybe it was a dummy seed path), we can't upload to Cloudinary.
      // But we still need to clear localhost paths.
      // We will mark it as missing or just leave it.
      continue;
    }

    try {
      const uploadResult = await cloudinary.upload({
        buffer: fileBuffer,
        fileName: media.filename,
        mimeType: media.mimeType || 'image/png',
      });

      await prisma.media.update({
        where: { id: media.id },
        data: {
          storageProvider: 'CLOUDINARY',
          assetKey: uploadResult.storagePath,
          publicUrl: uploadResult.publicUrl,
        }
      });
      successCount++;
      console.log(`✅ Uploaded to Cloudinary: ${uploadResult.publicUrl}`);
    } catch (e: any) {
      console.error(`❌ Failed to upload ${media.filename}:`, e.message);
    }
  }

  console.log(`Migration complete. Successfully migrated ${successCount}/${localMedia.length} media files.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
