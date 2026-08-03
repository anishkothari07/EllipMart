import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { MediaService } from './packages/commerce/src/media/media.service';

async function main() {
  console.log("Starting Cloudinary Upload Test...");
  const mediaService = new MediaService();

  const testImagePath = path.join(process.cwd(), 'public', 'images', 'p-backpack.png');
  if (!fs.existsSync(testImagePath)) {
    throw new Error(`Test image not found at ${testImagePath}`);
  }

  const buffer = fs.readFileSync(testImagePath);

  console.log("Uploading to Cloudinary...");
  const result = await mediaService.uploadMedia({
    buffer,
    originalName: 'test-upload-backpack.png',
    mimeType: 'image/png',
    allowDuplicate: true,
  });

  console.log("Upload Result:");
  console.log(JSON.stringify(result, null, 2));

  if (!result.media.publicUrl?.includes('res.cloudinary.com')) {
    throw new Error(`Upload failed or returned non-Cloudinary URL: ${result.media.publicUrl}`);
  }

  console.log("SUCCESS: Image uploaded to Cloudinary successfully!");
}

main().catch(console.error);
