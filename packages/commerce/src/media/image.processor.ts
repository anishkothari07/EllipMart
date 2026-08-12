import crypto from "crypto";

export interface ProcessedImageMetadata {
  width?: number;
  height?: number;
  aspectRatio?: number;
  fileHash: string;
  dominantColor?: string;
  blurHash?: string;
}

export interface GeneratedVariant {
  variantName: string; // "THUMBNAIL", "SMALL", "MEDIUM", "LARGE", "WEBP", "AVIF"
  buffer: Buffer;
  width?: number;
  height?: number;
  mimeType: string;
  extension: string;
}

async function getSharp() {
  try {
    const sharpModule = await import("sharp");
    return sharpModule.default || sharpModule;
  } catch (err) {
    console.warn("Sharp image library is not available in this environment:", err);
    return null;
  }
}

export class ImageProcessor {
  /**
   * Calculate SHA-256 hash of a file buffer
   */
  static calculateFileHash(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Extract image metadata (dimensions, hash, dominant color, blur placeholder)
   */
  static async extractMetadata(buffer: Buffer, mimeType: string): Promise<ProcessedImageMetadata> {
    const fileHash = this.calculateFileHash(buffer);

    if (!mimeType.startsWith("image/") || mimeType.includes("svg")) {
      return { fileHash };
    }

    try {
      const sharp = await getSharp();
      if (!sharp) {
        return { fileHash };
      }

      const image = sharp(buffer);
      const meta = await image.metadata();

      const width = meta.width;
      const height = meta.height;
      const aspectRatio = width && height ? Number((width / height).toFixed(2)) : undefined;

      // Extract stats for dominant color
      let dominantColor: string | undefined = undefined;
      try {
        const stats = await image.stats();
        if (stats.dominant) {
          const { r, g, b } = stats.dominant;
          dominantColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        }
      } catch {}

      // Generate a tiny low-res base64 blur placeholder (16x16)
      let blurHash: string | undefined = undefined;
      try {
        const blurBuffer = await sharp(buffer)
          .resize(16, 16, { fit: "inside" })
          .toFormat("webp", { quality: 20 })
          .toBuffer();
        blurHash = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
      } catch {}

      return {
        width,
        height,
        aspectRatio,
        fileHash,
        dominantColor,
        blurHash,
      };
    } catch (err) {
      console.warn("Failed to extract full image metadata:", err);
      return { fileHash };
    }
  }

  /**
   * Generate multi-size responsive variants (THUMBNAIL, SMALL, MEDIUM, LARGE, WEBP)
   */
  static async generateVariants(buffer: Buffer, mimeType: string): Promise<GeneratedVariant[]> {
    if (!mimeType.startsWith("image/") || mimeType.includes("svg")) {
      return [];
    }

    const variants: GeneratedVariant[] = [];

    try {
      const sharp = await getSharp();
      if (!sharp) {
        return variants;
      }

      // 1. THUMBNAIL (150x150 cover crop)
      const thumbBuffer = await sharp(buffer)
        .resize(150, 150, { fit: "cover" })
        .toFormat("webp", { quality: 80 })
        .toBuffer();
      variants.push({
        variantName: "THUMBNAIL",
        buffer: thumbBuffer,
        width: 150,
        height: 150,
        mimeType: "image/webp",
        extension: "webp",
      });

      // 2. SMALL (max 300px)
      const smallMeta = await sharp(buffer).resize(300, 300, { fit: "inside", withoutEnlargement: true }).toFormat("webp", { quality: 80 }).toBuffer({ resolveWithObject: true });
      variants.push({
        variantName: "SMALL",
        buffer: smallMeta.data,
        width: smallMeta.info.width,
        height: smallMeta.info.height,
        mimeType: "image/webp",
        extension: "webp",
      });

      // 3. MEDIUM (max 600px)
      const medMeta = await sharp(buffer).resize(600, 600, { fit: "inside", withoutEnlargement: true }).toFormat("webp", { quality: 85 }).toBuffer({ resolveWithObject: true });
      variants.push({
        variantName: "MEDIUM",
        buffer: medMeta.data,
        width: medMeta.info.width,
        height: medMeta.info.height,
        mimeType: "image/webp",
        extension: "webp",
      });

      // 4. LARGE (max 1200px)
      const largeMeta = await sharp(buffer).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).toFormat("webp", { quality: 85 }).toBuffer({ resolveWithObject: true });
      variants.push({
        variantName: "LARGE",
        buffer: largeMeta.data,
        width: largeMeta.info.width,
        height: largeMeta.info.height,
        mimeType: "image/webp",
        extension: "webp",
      });

      // 5. WEBP (Full original converted to WebP)
      const webpMeta = await sharp(buffer).toFormat("webp", { quality: 85 }).toBuffer({ resolveWithObject: true });
      variants.push({
        variantName: "WEBP",
        buffer: webpMeta.data,
        width: webpMeta.info.width,
        height: webpMeta.info.height,
        mimeType: "image/webp",
        extension: "webp",
      });

    } catch (err) {
      console.warn("Failed generating image variants:", err);
    }

    return variants;
  }
}
